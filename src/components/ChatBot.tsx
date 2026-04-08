import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, User, Phone, Headset, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

const supabase = supabaseClient as any;

interface Message {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: Date;
}

export function ChatBot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);

    // Guest Form State
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [showGuestForm, setShowGuestForm] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [hasAlert, setHasAlert] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll alert logic
    useEffect(() => {
        const handleScroll = () => {
            // Trigger alert if scrolled more than 400px and chat is closed
            if (window.scrollY > 400 && !hasAlert && !isOpen && !chatId) {
                setHasAlert(true);
                // Play notification sound
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2857/2857-preview.mp3");
                audio.volume = 0.5;
                audio.play().catch(e => console.warn("Audio play blocked by browser", e));
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasAlert, isOpen, chatId]);

    // Reset alert when opening chat
    useEffect(() => {
        if (isOpen) {
            setHasAlert(false);
        }
    }, [isOpen]);

    // Initialize checks
    useEffect(() => {
        if (user) {
            setShowGuestForm(false);
        } else {
            setShowGuestForm(true);
        }
    }, [user]);

    // Subscribe to messages when chat is active
    useEffect(() => {
        if (!chatId) return;

        // Fetch existing messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data.map((m: any) => ({
                    id: m.id,
                    sender: m.sender,
                    text: m.message,
                    timestamp: new Date(m.created_at)
                })));
            }
        };

        fetchMessages();

        // Realtime subscription
        const channel = supabase
            .channel('chat_room')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload: any) => {
                    const newMessage = payload.new;
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === newMessage.id)) return prev;
                        return [...prev, {
                            id: newMessage.id,
                            sender: newMessage.sender,
                            text: newMessage.message,
                            timestamp: new Date(newMessage.created_at)
                        }];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId]);

    // Handle chat resolution status updates
    useEffect(() => {
        if (!chatId) return;

        const channel = supabase
            .channel('chat_status')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'support_chats',
                    filter: `id=eq.${chatId}`
                },
                (payload: any) => {
                    const updatedChat = payload.new;
                    if (updatedChat.status === 'resolved') {
                        setTimeout(() => {
                            setIsOpen(false);
                            setChatId(null);
                            setMessages([]);
                            toast.info("Chat ended by support agent");
                        }, 4000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initiateChat = async (name?: string, phone?: string) => {
        setIsConnecting(true);
        try {
            // 1. Create a chat session in Supabase
            const { data, error } = await supabase
                .from('support_chats')
                .insert({
                    user_id: user?.id || null,
                    guest_name: user?.user_metadata?.full_name || name,
                    guest_phone: phone || null,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            setChatId(data.id);

            // 2. Add welcome message from system/agent
            const welcomeMsg = `Hello ${user?.user_metadata?.full_name || name || 'there'}! Welcome to Nirosha support. How can I help you?`;
            
            // Add locally first for instant feedback
            setMessages([{
                id: 'welcome-' + Date.now(),
                sender: 'agent',
                text: welcomeMsg,
                timestamp: new Date()
            }]);

            await supabase
                .from('support_messages')
                .insert({
                    chat_id: data.id,
                    sender: 'agent',
                    message: welcomeMsg
                });

            toast.success("Connected to support!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to start chat. Please try again.");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim()) {
            toast.error("Please enter your name");
            return;
        }
        setShowGuestForm(false);
        initiateChat(guestName, guestPhone);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chatId) return;

        const messageText = input;
        setInput("");

        // Optimistically add message to state
        const tempId = 'temp-' + Date.now();
        setMessages(prev => [...prev, {
            id: tempId,
            sender: 'user',
            text: messageText,
            timestamp: new Date()
        }]);

        const { error, data } = await supabase
            .from('support_messages')
            .insert({
                chat_id: chatId,
                sender: 'user',
                message: messageText
            })
            .select()
            .single();

        if (error) {
            // Remove the optimistic message if it failed
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error("Failed to send message");
        } else if (data) {
            // Replace optimistic message with real message from DB to sync ID
            setMessages(prev => prev.map(m => 
                m.id === tempId ? {
                    id: data.id,
                    sender: data.sender,
                    text: data.message,
                    timestamp: new Date(data.created_at)
                } : m
            ));
        }
    };

    // Auto-initiate REMOVED: User must explicitly click "Contact Support"

    const handleStartSupport = () => {
        if (user) {
            initiateChat();
        } else {
            setShowGuestForm(true);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[320px] sm:w-[350px] shadow-2xl rounded-2xl overflow-hidden border border-border/50"
                    >
                        <Card className="h-[450px] flex flex-col border-0">
                            {/* Header */}
                            <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between space-y-0 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <Headset className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">Nirosha Support</CardTitle>
                                        <p className="text-xs text-white/80 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>

                            {/* Content */}
                            <CardContent className="flex-1 overflow-hidden p-0 bg-secondary/5 relative">
                                {!chatId && ((!user && showGuestForm) || (user && !isConnecting)) ? (
                                    <div className="h-full flex flex-col items-center justify-center p-6 space-y-6">
                                        <div className="text-center space-y-2">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MessageCircle className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg">How can we help?</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {user
                                                    ? `Hi ${user.user_metadata?.full_name || 'there'}! Connect with a support agent.`
                                                    : "Please enter your details to connect with a support agent."
                                                }
                                            </p>
                                        </div>

                                        {user ? (
                                            <Button onClick={handleStartSupport} className="w-full" size="lg">
                                                Contact Support
                                            </Button>
                                        ) : (
                                            <form onSubmit={handleGuestSubmit} className="w-full space-y-4">
                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Your Name"
                                                            className="pl-9"
                                                            value={guestName}
                                                            onChange={(e) => setGuestName(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Contact Number"
                                                            className="pl-9"
                                                            type="tel"
                                                            value={guestPhone}
                                                            onChange={(e) => setGuestPhone(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <Button type="submit" className="w-full" disabled={isConnecting}>
                                                    {isConnecting ? <Loader2 className="animate-spin" /> : "Start Chat"}
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {isConnecting && (
                                                <div className="flex justify-center py-4">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Connecting to agent...
                                                    </div>
                                                </div>
                                            )}

                                            {messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        "flex w-full mb-2",
                                                        msg.sender === 'user' ? "justify-end" : "justify-start"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                                                            msg.sender === 'user'
                                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                                : "bg-card border shadow-sm rounded-bl-none text-foreground"
                                                        )}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}

                                            <div ref={messagesEndRef} />
                                        </div>

                                        <div className="p-3 bg-background border-t">
                                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Type your message..."
                                                    className="flex-1 rounded-full bg-muted/50 border-transparent focus:bg-background transition-all"
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                />
                                                <Button
                                                    type="submit"
                                                    size="icon"
                                                    className="rounded-full h-10 w-10 shrink-0"
                                                    disabled={!input.trim() || !chatId}
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </form>
                                            <div className="text-[10px] text-center text-muted-foreground mt-2">
                                                Powered by CreativeX Technology
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={hasAlert && !isOpen ? {
                    scale: [1, 1.15, 1, 1.15, 1],
                    rotate: [0, -10, 10, -10, 10, 0],
                } : { scale: 1, rotate: 0 }}
                transition={hasAlert && !isOpen ? {
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 2
                } : { duration: 0.2 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-colors hover:bg-primary/90",
                    isOpen && "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}

                {hasAlert && !isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
