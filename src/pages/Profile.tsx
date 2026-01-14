import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Edit2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { BusLoader } from "@/components/BusLoader";

export default function Profile() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState({
        fullName: "",
        phone: "",
        avatarUrl: "",
    });
    const [editedProfile, setEditedProfile] = useState(profile);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            const fullName = user.user_metadata?.full_name || "";
            const phone = user.user_metadata?.phone || "";
            const avatarUrl = user.user_metadata?.avatar_url || "";

            setProfile({ fullName, phone, avatarUrl });
            setEditedProfile({ fullName, phone, avatarUrl });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: editedProfile.fullName,
                    phone: editedProfile.phone,
                },
            });

            if (error) throw error;

            setProfile(editedProfile);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const getInitials = () => {
        if (!profile.fullName) return "U";
        return profile.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col pt-20">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <BusLoader className="h-48 w-48" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Profile Header Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="mb-6 overflow-hidden border-2">
                            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
                            <CardContent className="relative pt-0 pb-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16">
                                    {/* Avatar with Upload */}
                                    <AvatarUpload
                                        currentAvatarUrl={profile.avatarUrl}
                                        userName={profile.fullName}
                                        userId={user?.id || ""}
                                        onAvatarUpdate={(url) => {
                                            setProfile({ ...profile, avatarUrl: url });
                                            setEditedProfile({ ...editedProfile, avatarUrl: url });
                                        }}
                                    />

                                    {/* Profile Info */}
                                    <div className="flex-1 text-center sm:text-left sm:mt-16">
                                        <h1 className="text-3xl font-bold text-foreground">
                                            {profile.fullName || "User"}
                                        </h1>
                                        <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <Mail className="h-4 w-4" />
                                            {user?.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            Joined {new Date(user?.created_at || "").toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Edit Button */}
                                    <motion.div
                                        className="sm:mt-16"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {!isEditing ? (
                                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Edit Profile
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button onClick={handleSave} disabled={isSaving}>
                                                    {isSaving ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4 mr-2" />
                                                    )}
                                                    Save
                                                </Button>
                                                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Personal Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>Update your personal details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            value={isEditing ? editedProfile.fullName : profile.fullName}
                                            onChange={(e) =>
                                                setEditedProfile({ ...editedProfile, fullName: e.target.value })
                                            }
                                            disabled={!isEditing}
                                            className={!isEditing ? "bg-muted" : ""}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="bg-muted"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={isEditing ? editedProfile.phone : profile.phone}
                                            onChange={(e) =>
                                                setEditedProfile({ ...editedProfile, phone: e.target.value })
                                            }
                                            disabled={!isEditing}
                                            placeholder="+94 XX XXX XXXX"
                                            className={!isEditing ? "bg-muted" : ""}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Account Settings */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Settings</CardTitle>
                                    <CardDescription>Manage your account preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Account Status</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm text-muted-foreground">Active</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Security</h3>
                                        <Button variant="outline" className="w-full" onClick={() => toast.info("Password change coming soon!")}>
                                            Change Password
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium mb-2 text-destructive">
                                            Danger Zone
                                        </h3>
                                        <Button variant="destructive" className="w-full" onClick={() => toast.error("Delete account feature coming soon!")}>
                                            Delete Account
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
