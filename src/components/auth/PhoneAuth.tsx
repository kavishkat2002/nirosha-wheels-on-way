import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Smartphone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OTPInput } from "@/components/ui/otp-input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PhoneAuthProps {
    onSuccess?: () => void;
}

export function PhoneAuth({ onSuccess }: PhoneAuthProps) {
    const [countryCode, setCountryCode] = useState("+94");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showOTPDialog, setShowOTPDialog] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Mock OTP for demo (in production, this comes via SMS)
    const mockOTP = useRef("");

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, "");

        // Format as XX XXX XXXX for Sri Lankan numbers
        if (digits.length <= 2) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
        return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    const handleSendOTP = async () => {
        const cleanPhone = phoneNumber.replace(/\s/g, "");

        if (cleanPhone.length < 9) {
            toast.error("Please enter a valid phone number");
            return;
        }

        const fullPhone = `${countryCode}${cleanPhone}`;

        setIsSendingOTP(true);
        try {
            // DEMO MODE: Generate mock OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            mockOTP.current = otp;

            // Show OTP in console for demo
            console.log("🔐 DEMO OTP CODE:", otp);
            console.log("📱 Phone:", fullPhone);

            // In production, use Supabase phone auth:
            // const { error } = await supabase.auth.signInWithOtp({
            //   phone: fullPhone
            // });
            // if (error) throw error;

            toast.success(`Demo: OTP sent! Check console for code`);
            setShowOTPDialog(true);
            setResendTimer(60);

            // Start countdown
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP");
        } finally {
            setIsSendingOTP(false);
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        setIsVerifying(true);
        try {
            // DEMO MODE: Check against mock OTP
            if (otp !== mockOTP.current) {
                throw new Error("Invalid OTP code");
            }

            // In production, use Supabase verification:
            // const cleanPhone = phoneNumber.replace(/\s/g, "");
            // const fullPhone = `${countryCode}${cleanPhone}`;
            // const { error } = await supabase.auth.verifyOtp({
            //   phone: fullPhone,
            //   token: otp,
            //   type: 'sms'
            // });
            // if (error) throw error;

            toast.success("Phone verified successfully!");
            setShowOTPDialog(false);
            mockOTP.current = "";

            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Invalid OTP code");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger id="country">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="+94">🇱🇰 Sri Lanka (+94)</SelectItem>
                                <SelectItem value="+91">🇮🇳 India (+91)</SelectItem>
                                <SelectItem value="+1">🇺🇸 USA (+1)</SelectItem>
                                <SelectItem value="+44">🇬🇧 UK (+44)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex gap-2">
                            <div className="flex items-center px-3 bg-muted rounded-md border min-w-[70px]">
                                <span className="text-sm font-medium">{countryCode}</span>
                            </div>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="77 123 4567"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                maxLength={12}
                                className="flex-1"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Demo mode: OTP will be shown in browser console
                        </p>
                    </div>

                    <Button
                        onClick={handleSendOTP}
                        disabled={isSendingOTP || phoneNumber.length < 9}
                        className="w-full"
                    >
                        {isSendingOTP ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending OTP...
                            </>
                        ) : (
                            <>
                                <Smartphone className="mr-2 h-4 w-4" />
                                Send OTP Code
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* OTP Verification Dialog */}
            <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Verification Code</DialogTitle>
                        <DialogDescription>
                            We've sent a 6-digit code to {countryCode} {phoneNumber}
                            <br />
                            <span className="text-xs text-primary">
                                (Demo: Check browser console for code)
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        <OTPInput
                            length={6}
                            onComplete={handleVerifyOTP}
                            disabled={isVerifying}
                        />

                        {isVerifying && (
                            <div className="flex items-center justify-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying code...
                            </div>
                        )}

                        <div className="text-center text-sm text-muted-foreground">
                            {resendTimer > 0 ? (
                                <p>Resend code in {resendTimer}s</p>
                            ) : (
                                <Button
                                    variant="link"
                                    onClick={handleSendOTP}
                                    disabled={isSendingOTP}
                                >
                                    Resend Code
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
