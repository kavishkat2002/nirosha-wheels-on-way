import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, User as UserIcon, Loader2, Trash2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AvatarUploadProps {
    currentAvatarUrl: string;
    userName: string;
    userId: string;
    onAvatarUpdate: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, userName, userId, onAvatarUpdate }: AvatarUploadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [gender, setGender] = useState<"male" | "female">("male");
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = () => {
        if (!userName) return "U";
        return userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate avatar using DiceBear API
    const generateAvatar = (selectedGender: "male" | "female") => {
        const style = selectedGender === "male" ? "avataaars" : "avataaars";
        const seed = userName || "user";
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    const handleGenerateAvatar = async () => {
        setIsUploading(true);
        try {
            const avatarUrl = generateAvatar(gender);

            // Update user metadata
            const { error } = await supabase.auth.updateUser({
                data: {
                    avatar_url: avatarUrl,
                    gender: gender,
                },
            });

            if (error) throw error;

            onAvatarUpdate(avatarUrl);
            toast.success("Avatar generated successfully!");
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to generate avatar");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            // Create unique file name
            const fileExt = file.name.split(".").pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(data.path);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    avatar_url: publicUrl,
                },
            });

            if (updateError) throw updateError;

            onAvatarUpdate(publicUrl);
            toast.success("Avatar uploaded successfully!");
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setIsUploading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    avatar_url: null,
                },
            });

            if (error) throw error;

            onAvatarUpdate("");
            toast.success("Avatar removed successfully!");
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to remove avatar");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setIsOpen(true)}
            >
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={currentAvatarUrl} alt={userName} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {getInitials()}
                    </AvatarFallback>
                </Avatar>
                <motion.div
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Camera className="h-4 w-4" />
                </motion.div>
            </motion.div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                            Generate an avatar or upload your own photo
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Auto-generate Avatar */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-medium">Generate Avatar</h3>
                            </div>

                            <RadioGroup value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="female" />
                                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                                </div>
                            </RadioGroup>

                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={generateAvatar(gender)} />
                                    <AvatarFallback>{getInitials()}</AvatarFallback>
                                </Avatar>
                                <Button
                                    onClick={handleGenerateAvatar}
                                    disabled={isUploading}
                                    className="flex-1"
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 mr-2" />
                                    )}
                                    Generate
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        {/* Upload Photo */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-medium">Upload Photo</h3>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                variant="outline"
                                className="w-full"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                )}
                                Choose from Gallery
                            </Button>
                        </div>

                        {/* Delete Avatar */}
                        {currentAvatarUrl && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleDeleteAvatar}
                                    disabled={isUploading}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Avatar
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
