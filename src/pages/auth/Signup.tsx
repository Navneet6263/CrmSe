import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cloud, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "12345678";

const benefits = [
  "5 GB free storage",
  "Share files with anyone",
  "Access from any device",
  "Bank-level encryption",
];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast.error(error.message || "Failed to create account");
      setLoading(false);
    } else {
      toast.success("Account created successfully!");
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-black p-16 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-md"
        >
          <h2 className="text-3xl font-bold text-primary-foreground mb-6">
            Start storing your files safely today
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.li
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 text-primary-foreground/90"
              >
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                {benefit}
              </motion.li>
            ))}
          </ul>
          
          {/* Demo credentials */}
          <div className="mt-10 p-4 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-left">
            <p className="text-sm font-medium text-primary-foreground mb-3">Demo Admin Access:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-primary-foreground/80">
                  <span className="font-medium">Username:</span> {DEMO_EMAIL}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEMO_EMAIL, "Username")}
                  className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
                >
                  {copiedField === "Username" ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-primary-foreground/60" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-primary-foreground/80">
                  <span className="font-medium">Password:</span> {DEMO_PASSWORD}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEMO_PASSWORD, "Password")}
                  className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
                >
                  {copiedField === "Password" ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-primary-foreground/60" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <Cloud className="w-8 h-8 text-foreground" />
            <span className="text-xl font-semibold text-foreground">Cloudly</span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Get started with 5 GB of free storage. No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-black hover:bg-black/90" size="lg" disabled={loading || !acceptTerms}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {/* Mobile/Tablet Demo credentials */}
          <div className="lg:hidden mt-8 p-4 rounded-xl bg-muted/50 border border-border text-left">
            <p className="text-sm font-medium text-foreground mb-3">Demo Admin Access:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Username:</span> {DEMO_EMAIL}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEMO_EMAIL, "Username")}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  {copiedField === "Username" ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Password:</span> {DEMO_PASSWORD}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEMO_PASSWORD, "Password")}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  {copiedField === "Password" ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
