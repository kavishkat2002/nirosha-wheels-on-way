import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    disabled?: boolean;
}

export function OTPInput({ length = 8, onComplete, disabled = false }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (disabled) return;

        // Only allow digits
        const digit = value.replace(/[^0-9]/g, "");

        if (digit.length > 1) return; // Prevent multiple digits

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto-advance to next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if complete
        if (newOtp.every((d) => d !== "")) {
            onComplete(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").slice(0, length);

        const newOtp = [...otp];
        pastedData.split("").forEach((char, i) => {
            if (i < length) {
                newOtp[i] = char;
            }
        });

        setOtp(newOtp);

        // Focus last filled input or next empty input
        const lastFilledIndex = newOtp.findIndex((d) => d === "");
        const focusIndex = lastFilledIndex === -1 ? length - 1 : lastFilledIndex;
        inputRefs.current[focusIndex]?.focus();

        // Check if complete
        if (newOtp.every((d) => d !== "")) {
            onComplete(newOtp.join(""));
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-2xl font-semibold"
                    autoFocus={index === 0}
                />
            ))}
        </div>
    );
}
