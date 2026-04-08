import { Link } from "react-router-dom";
import { Bus, Facebook, Instagram, Youtube, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="bg-card border-t border-border/50">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <img
                                    src="/images/ne-logo.jpg"
                                    alt="Nirosha"
                                    className="h-8 w-8 object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-none">NIROSHA</span>
                                <span className="text-[10px] font-medium tracking-widest uppercase opacity-70">Enterprises</span>
                            </div>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Sri Lanka's premier passenger bus service. Experience luxury, safety, and punctuality on every journey.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink icon={Facebook} href="#" />
                            <SocialLink icon={TikTok} href="#" />
                            <SocialLink icon={Instagram} href="#" />
                            <SocialLink icon={Youtube} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/my-bookings" className="text-muted-foreground hover:text-primary transition-colors">My Bookings</Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 text-muted-foreground">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>123 Main Street, Pettah,<br />Colombo 11, Sri Lanka</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>+94 11 234 5678</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>info@nirosha.lk</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-6">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Subscribe to our newsletter for the latest updates and exclusive offers.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter your email"
                                className="bg-background border-border"
                            />
                            <Button size="icon" className="shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p className="opacity-70">&copy; Designed & Developed By CreativeX Technology</p>
                    <p className="font-medium">&copy; {new Date().getFullYear()} NIROSHA ENTERPRISES. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <a
            href={href}
            className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
            <Icon className="h-4 w-4" />
        </a>
    );
}

// Custom TikTok Icon
const TikTok = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);
