import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Please enter your email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  // Helper to detect if input is email or phone
  const isEmail = (input: string) => {
    return input.includes('@');
  };

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    // Detect if emailOrPhone is an email or phone number
    const isEmailLogin = isEmail(values.emailOrPhone);

    if (isEmailLogin) {
      // Login with email
      const { error } = await signIn(values.emailOrPhone, values.password);

      if (error) {
        setIsLoading(false);
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/");
        setIsLoading(false);
      }
    } else {
      // Login with phone number - lookup email from profiles table
      try {
        const cleanPhone = values.emailOrPhone.replace(/\s/g, "");

        // Query profiles table for email by phone
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', cleanPhone)
          .single();

        if (error || !data) {
          toast.error("No account found with this phone number. Please use your email or sign up.");
          setIsLoading(false);
          return;
        }

        // Login with found email
        const { error: loginError } = await signIn(data.email, values.password);

        if (loginError) {
          toast.error(loginError.message);
          setIsLoading(false);
        } else {
          toast.success("Welcome back!");
          navigate("/");
          setIsLoading(false);
        }
      } catch (error: any) {
        toast.error(error.message || "Login failed");
        setIsLoading(false);
      }
    }
  };

  const onAdminLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    // Admin must use email
    if (!isEmail(values.emailOrPhone)) {
      toast.error("Admin login requires email address");
      setIsLoading(false);
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: values.emailOrPhone,
      password: values.password,
    });

    if (authError) {
      setIsLoading(false);
      toast.error(authError.message);
      return;
    }

    if (user) {
      const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin' as any);

      const isDesignatedAdmin = user.email === 'kavishkathilakarathna0@gmail.com' || user.email === 'tkavishka101@gmail.com' || user.email === 'admin@nirosha.lk' || user.email === 'creativexlab@tech.com' || user.email === 'test@admin.lk' || user.email?.toLowerCase() === 'info@creativexlab.online';

      if ((roleError || !isAdmin) && !isDesignatedAdmin) {
        await supabase.auth.signOut();
        setIsLoading(false);
        toast.error("Access Denied: You do not have administrator privileges.");
        return;
      }

      toast.success("Welcome, Administrator!");
      navigate("/admin");
    }
    setIsLoading(false);
  };

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    const { error } = await signUp(values.email, values.password, values.fullName);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for an 8-digit code!");
      navigate(`/email-verification?email=${encodeURIComponent(values.email)}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset link sent to your email!");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 flex flex-col lg:flex-row">
      <Header />

      {/* Left Side - Hero Image (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-muted items-center justify-center overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] z-10" />
        <img
          src="/images/login-illustration.jpg"
          alt="Travel with Nirosha"
          className="object-cover w-full h-full absolute inset-0 transition-transform duration-700 hover:scale-105"
        />
        <div className="relative z-20 text-center p-8 max-w-lg bg-background/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
            Journey with Confidence
          </h2>
          <p className="text-white/90 text-lg font-medium drop-shadow-sm">
            Experience premium comfort and safety on every mile of your trip across Sri Lanka.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12 w-full">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-10 duration-500 fade-in">

          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img
                src="/images/ne-logo.jpg"
                alt="Nirosha Enterprises"
                className="h-24 w-auto object-contain rounded-lg shadow-lg hover:shadow-primary/20 transition-shadow duration-300"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">NIROSHA ENTERPRISES</h1>
            <p className="text-muted-foreground mt-2 font-medium uppercase tracking-widest text-xs bg-muted inline-block px-3 py-1 rounded-full">
              Passenger Service
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              Sign in to manage your bookings and view tickets
            </p>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="pb-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-2">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>Login</span>
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>Sign Up</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
                  <div className="mb-4">
                    <CardTitle className="text-lg">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </div>

                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="emailOrPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email or Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com or 0771234567" {...field} className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                Forgot?
                              </button>
                            </div>
                            <FormControl>
                              <Input placeholder="••••••••" type="password" {...field} className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
                  <div className="mb-4">
                    <CardTitle className="text-lg">Create Account</CardTitle>
                    <CardDescription>Join us to book tickets easily</CardDescription>
                  </div>

                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                      <FormField
                        control={signupForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" type="email" {...field} className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="0771234567" type="tel" {...field} className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input placeholder="••••••" type="password" {...field} className="bg-muted/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm</FormLabel>
                              <FormControl>
                                <Input placeholder="••••••" type="password" {...field} className="bg-muted/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="admin" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex flex-col items-center mb-6 text-center bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary ring-4 ring-primary/5">
                      <Lock className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Admin Portal</CardTitle>
                    <CardDescription>Restricted access for staff only</CardDescription>
                  </div>

                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onAdminLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="emailOrPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Email</FormLabel>
                            <FormControl>
                              <Input placeholder="admin@nirosha.lk" type="email" {...field} className="bg-muted/50 border-primary/20 focus:border-primary transition-all font-mono text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Key</FormLabel>
                            <FormControl>
                              <Input placeholder="••••••••••••" type="password" {...field} className="bg-muted/50 border-primary/20 focus:border-primary transition-all font-mono text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-semibold mt-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Verify & Access
                      </Button>
                    </form>
                  </Form>
                  <p className="text-[10px] text-center text-muted-foreground mt-6 uppercase tracking-widest font-bold opacity-40 select-none">
                    Security Logged & Monitored
                  </p>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleForgotPassword}
              disabled={isResetting}
              className="w-full"
            >
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
