import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log("Form submitted:", formData);
            toast.success("Message sent successfully! We'll get back to you soon.");
            setFormData({ name: "", email: "", message: "" });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                        <p className="text-muted-foreground text-lg">
                            We'd love to hear from you. Please send us a message or visit our office.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Our Office</h3>
                                        <p className="text-muted-foreground">
                                            123 Main Street, Pettah <br />
                                            Colombo 11, Sri Lanka
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Phone</h3>
                                        <p className="text-muted-foreground">+94 11 234 5678</p>
                                        <p className="text-muted-foreground">+94 77 123 4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Email</h3>
                                        <p className="text-muted-foreground">info@nirosha.lk</p>
                                        <p className="text-muted-foreground">support@nirosha.lk</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-muted rounded-xl h-64 w-full flex items-center justify-center border">
                                <p className="text-muted-foreground">Map Integration (Google Maps)</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card border rounded-xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                                    <Input
                                        id="name"
                                        placeholder="Your Name"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea
                                        id="message"
                                        placeholder="How can we help you?"
                                        rows={5}
                                        required
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : (
                                        <>
                                            Send Message <Send className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
