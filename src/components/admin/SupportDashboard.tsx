import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { User, Phone, MessageSquare, Clock, Search, Send, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

const supabase = supabaseClient as any;

interface ChatSession {
    id: string;
    customerName: string;
    customerPhone?: string;
    status: 'active' | 'pending' | 'resolved';
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
}

interface ChatMessage {
    id: string;
    text: string;
    sender: 'agent' | 'user';
    timestamp: Date;
}

export function SupportDashboard() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchSessions = async () => {
        const { data, error } = await supabase
            .from('support_chats')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setSessions(data.map((chat: any) => ({
                id: chat.id,
                customerName: chat.guest_name || "Unknown User",
                customerPhone: chat.guest_phone,
                status: chat.status,
                lastMessage: "Conversation Active",
                lastMessageTime: new Date(chat.created_at),
                unreadCount: 0
            })));
        }
    };

    // Fetch Sessions on Mount
    useEffect(() => {
        fetchSessions();

        // Subscribe to NEW or DELETED sessions
        const channel = supabase
            .channel('admin_chats_global')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'support_chats' },
                (payload: any) => {
                    console.log("Realtime change received:", payload);
                    if (payload.eventType === 'INSERT') {
                        const newChat = payload.new;
                        setSessions(prev => [{
                            id: newChat.id,
                            customerName: newChat.guest_name || "Unknown User",
                            customerPhone: newChat.guest_phone,
                            status: newChat.status,
                            lastMessage: "New Conversation",
                            lastMessageTime: new Date(newChat.created_at),
                            unreadCount: 1
                        }, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        const deletedId = payload.old?.id;
                        if (deletedId) {
                            setSessions(prev => prev.filter(s => s.id !== deletedId));
                            // If the deleted chat was the one open, close it
                            setSelectedSessionId(current => current === deletedId ? null : current);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedChat = payload.new;
                        setSessions(prev => prev.map(s =>
                            s.id === updatedChat.id ? { ...s, status: updatedChat.status } : s
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Fetch Messages for Selected Session
    useEffect(() => {
        if (!selectedSessionId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .eq('chat_id', selectedSessionId)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data.map((m: any) => ({
                    id: m.id,
                    text: m.message,
                    sender: m.sender,
                    timestamp: new Date(m.created_at)
                })));
            }
        };

        fetchMessages();

        const channel = supabase
            .channel(`chat_${selectedSessionId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${selectedSessionId}` },
                (payload: any) => {
                    const newMsg = payload.new;
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, {
                            id: newMsg.id,
                            text: newMsg.message,
                            sender: newMsg.sender,
                            timestamp: new Date(newMsg.created_at)
                        }];
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${selectedSessionId}` },
                (payload: any) => {
                    const deletedId = payload.old?.id;
                    if (deletedId) {
                        setMessages(prev => prev.filter(m => m.id !== deletedId));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedSessionId) return;

        const text = inputText;
        setInputText("");

        // Optimistically add message to state
        const tempId = 'temp-' + Date.now();
        setMessages(prev => [...prev, {
            id: tempId,
            text: text,
            sender: 'agent',
            timestamp: new Date()
        }]);

        const { error, data } = await supabase
            .from('support_messages')
            .insert({
                chat_id: selectedSessionId,
                sender: 'agent',
                message: text
            })
            .select()
            .single();

        if (error) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error("Failed to send reply");
        } else if (data) {
            // Replace with actual data from DB
            setMessages(prev => prev.map(m =>
                m.id === tempId ? {
                    id: data.id,
                    text: data.message,
                    sender: data.sender,
                    timestamp: new Date(data.created_at)
                } : m
            ));
        }
    };

    const handleResolve = async () => {
        if (!selectedSessionId) return;

        const { error: updateError } = await supabase
            .from('support_chats')
            .update({ status: 'resolved' })
            .eq('id', selectedSessionId);

        if (updateError) {
            toast.error("Failed to resolve chat");
            return;
        }

        await supabase
            .from('support_messages')
            .insert({
                chat_id: selectedSessionId,
                sender: 'agent',
                message: 'Ticket closing. Thank you for contacting Nirosha Enterprises Passenger support!'
            });

        toast.success("Chat resolved");
    };

    const handleDeleteChat = async () => {
        if (!selectedSessionId) return;

        if (!confirm("Are you sure you want to delete this entire chat history? This action cannot be undone.")) {
            return;
        }

        const chatToDeleteId = selectedSessionId;

        // Note: support_messages have 'on delete cascade' on foreign key to support_chats
        const { error } = await supabase
            .from('support_chats')
            .delete()
            .eq('id', chatToDeleteId);

        if (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete chat session");
        } else {
            toast.success("Chat deleted successfully");
            setSelectedSessionId(null);
            setSessions(prev => prev.filter(s => s.id !== chatToDeleteId));
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        const { error } = await supabase
            .from('support_messages')
            .delete()
            .eq('id', messageId);

        if (error) {
            toast.error("Failed to delete message");
        } else {
            toast.success("Message deleted");
        }
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Session List */}
            <Card className="col-span-1 flex flex-col h-full border-border/50">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-lg">Inbox</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-8" />
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-1 p-2">
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => setSelectedSessionId(session.id)}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl text-left transition-colors hover:bg-muted/50",
                                    selectedSessionId === session.id && "bg-muted"
                                )}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{session.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold truncate text-sm">{session.customerName}</span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {session.lastMessageTime ? format(new Date(session.lastMessageTime), "h:mm a") : ""}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{session.lastMessage}</p>
                                </div>
                                {session.unreadCount > 0 && (
                                    <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0">
                                        {session.unreadCount}
                                    </Badge>
                                )}
                            </button>
                        ))}
                        {sessions.length === 0 && (
                            <p className="text-center text-muted-foreground text-sm mt-8">No active chats found.</p>
                        )}
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="col-span-1 md:col-span-2 flex flex-col h-full border-border/50">
                {selectedSession ? (
                    <>
                        <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{selectedSession.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{selectedSession.customerName}</CardTitle>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {selectedSession.customerPhone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {selectedSession.customerPhone}
                                            </span>
                                        )}
                                        <Badge variant={selectedSession.status === 'active' ? 'default' : selectedSession.status === 'resolved' ? 'secondary' : 'outline'} className="text-[10px] h-4">
                                            {selectedSession.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleResolve} disabled={selectedSession.status === 'resolved'}>
                                    <Check className="h-4 w-4 mr-2" /> Resolve
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDeleteChat} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete Chat
                                </Button>
                            </div>
                        </CardHeader>

                        <ScrollArea className="flex-1 p-4 bg-muted/10">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full group",
                                            msg.sender === 'agent' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 max-w-[70%]">
                                            {msg.sender === 'agent' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <div
                                                className={cn(
                                                    "p-3 rounded-2xl text-sm w-full",
                                                    msg.sender === 'agent'
                                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                                        : "bg-background border shadow-sm rounded-bl-none"
                                                )}
                                            >
                                                <p>{msg.text}</p>
                                                <p className={cn(
                                                    "text-[10px] mt-1 text-right opacity-70",
                                                    msg.sender === 'agent' ? "text-primary-foreground" : "text-muted-foreground"
                                                )}>
                                                    {format(new Date(msg.timestamp), "h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder="Type your reply..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Chat Selected</h3>
                        <p>Select a conversation from the list to start replying.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
