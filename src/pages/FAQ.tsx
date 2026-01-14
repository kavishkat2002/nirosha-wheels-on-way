import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            question: "How do I book a ticket?",
            answer: "You can book a ticket by searching for your desired route on our home page, selecting a bus, choosing your seats, and proceeding to payment. Once confirmed, you will receive a digital ticket with a QR code."
        },
        {
            question: "Can I cancel my booking?",
            answer: "Yes, cancellations are allowed up to 24 hours before departure. Please contact our support team or go to 'My Bookings' section to initiate a cancellation request. Refund policies may apply."
        },
        {
            question: "Do I need to print my ticket?",
            answer: "No, a printed ticket is not mandatory. You can show the digital ticket (PDF) or the QR code on your mobile device to the conductor at the time of boarding."
        },
        {
            question: "Is there a baggage limit?",
            answer: "Each passenger is allowed one main luggage bag (up to 20kg) and one hand luggage. Extra luggage may be charged separately depending on the remaining space."
        },
        {
            question: "How can I contact support?",
            answer: "You can reach our customer support via the 'Contact Us' page, email us at support@nirosha.alk, or call our hotline at +94 11 234 5678."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h1>
                        <p className="text-muted-foreground">Everything you need to know about our services.</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left font-medium">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    <div className="text-center bg-secondary/10 p-6 rounded-xl">
                        <h3 className="font-semibold mb-2">Still have questions?</h3>
                        <p className="text-sm text-muted-foreground">
                            Can't find the answer you're looking for? Please chat to our friendly team.
                        </p>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
