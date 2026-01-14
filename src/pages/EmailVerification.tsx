import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { OTPInput } from "@/components/ui/otp-input";
import { supabase } from "@/integrations/supabase/client";

export default function EmailVerification() {
    const [searchParams] = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");
    const navigate = useNavigate();
    const { verifyOtp } = useAuth();
    const email = searchParams.get("email") || "";

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleOtpComplete = async (otp: string) => {
        if (!email) {
            toast.error("Email address not found. Please sign up again.");
            return;
        }

        setIsVerifying(true);
        const { error } = await verifyOtp(email, otp);
        setIsVerifying(false);

        if (error) {
            setVerificationStatus("error");
            toast.error(error.message || "Invalid verification code");
        } else {
            setVerificationStatus("success");
            toast.success("Email verified successfully!");
            setTimeout(() => {
                navigate("/");
            }, 1500);
        }
    };

    const handleResendEmail = async () => {
        if (!email) {
            toast.error("Email address not found. Please sign up again.");
            return;
        }

        setIsResending(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: false, // Don't create a new user, just resend
            },
        });

        setIsResending(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Verification code resent!");
            setResendTimer(60); // 60 second cooldown
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader className="text-center">
                            {verificationStatus === "success" ? (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <CardTitle>Email Verified!</CardTitle>
                                    <CardDescription>
                                        Your email has been successfully verified. Redirecting you to the app...
                                    </CardDescription>
                                </>
                            ) : verificationStatus === "error" ? (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                    <CardTitle>Invalid Code</CardTitle>
                                    <CardDescription>
                                        The verification code you entered is incorrect or has expired. Please try again or request a new code.
                                    </CardDescription>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Mail className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Enter Verification Code</CardTitle>
                                    <CardDescription>
                                        We've sent an 8-digit code to {email}
                                    </CardDescription>
                                </>
                            )}
                        </CardHeader>

                        {verificationStatus === "pending" && (
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <OTPInput
                                        onComplete={handleOtpComplete}
                                        disabled={isVerifying}
                                    />

                                    {isVerifying && (
                                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying code...
                                        </div>
                                    )}
                                </div>

                                <div className="text-center text-sm text-muted-foreground space-y-2">
                                    <p>Enter the 8-digit code from your email</p>
                                    <p className="text-xs">
                                        <strong>Tip:</strong> Check your spam folder if you don't see the email
                                    </p>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-center text-muted-foreground mb-3">
                                        Didn't receive the code?
                                    </p>
                                    <Button
                                        onClick={handleResendEmail}
                                        disabled={isResending || resendTimer > 0 || isVerifying}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        {isResending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : resendTimer > 0 ? (
                                            `Resend in ${resendTimer}s`
                                        ) : (
                                            "Resend Code"
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate("/auth")}
                                        className="text-sm"
                                    >
                                        Back to Login
                                    </Button>
                                </div>
                            </CardContent>
                        )}

                        {verificationStatus === "error" && (
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={() => {
                                        setVerificationStatus("pending");
                                    }}
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={handleResendEmail}
                                    disabled={isResending || resendTimer > 0}
                                    className="w-full"
                                    variant="outline"
                                >
                                    {isResending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : resendTimer > 0 ? (
                                        `Resend in ${resendTimer}s`
                                    ) : (
                                        "Resend Code"
                                    )}
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
