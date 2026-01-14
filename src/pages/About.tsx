import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Bus, Shield, Users, Trophy } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto space-y-12"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            About Nirosha Enterprises
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Redefining luxury bus travel in Sri Lanka since 2010.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-2xl bg-card border shadow-sm">
                            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                To provide safe, reliable, and comfortable transportation services that connect people and places, ensuring a memorable journey for every passenger.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-card border shadow-sm">
                            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                To be the leading passenger transport service provider in Sri Lanka, known for innovation, customer satisfaction, and operational excellence.
                            </p>
                        </div>
                    </div>

                    {/* Key Values */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Bus, title: "Modern Fleet", desc: "State-of-the-art buses" },
                            { icon: Shield, title: "Safety First", desc: "Top safety standards" },
                            { icon: Users, title: "Customer Focus", desc: "24/7 dedicated support" },
                            { icon: Trophy, title: "Excellence", desc: "Award-winning service" },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-6 bg-secondary/10 rounded-xl">
                                <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                                <h4 className="font-semibold mb-1">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Story */}
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                        <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                            Founded in 2010, Nirosha Enterprises started with a single bus and a dream to transform public transport in Sri Lanka. Over the years, we have grown into a fleet of modern luxury buses, serving thousands of passengers daily across major routes including Colombo, Kandy, Galle, and Jaffna.
                        </p>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            We take pride in our punctuality, cleanliness, and the professional conduct of our staff. Our commitment to technology, such as our online booking platform, ensures a seamless experience for our valued customers.
                        </p>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
