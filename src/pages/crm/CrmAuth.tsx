import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { businessCategories } from "@/data/mockCrmData";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/crm/BrandMark";
import { BrandIcon, type BrandName } from "@/components/crm/BrandIcon";

export default function CrmAuth({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("salon");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSignup) {
      const { error } = await signUp(email, password, name);
      setLoading(false);
      if (error) return toast.error(error.message);
      setSubmitted(true);
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) return toast.error(error.message || "Login failed");
      const from = (location.state as any)?.from?.pathname || "/app";
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="crm mesh min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <BrandMark />
        <div>
          <h1 className="font-display text-5xl leading-tight mb-6">
            From Insta click to <span className="text-brand">confirmed booking</span> — all in one place.
          </h1>
          <div className="space-y-3 max-w-md">
            {[
              { brand: "Instagram" as BrandName, t: "Track every ad click by hour" },
              { brand: "WhatsApp" as BrandName, t: "WhatsApp booking flow — gender, service, slot" },
              { brand: "Google Calendar" as BrandName, t: "Auto-sync to Google Calendar" },
            ].map(({ brand, t }, k) => (
              <motion.div key={t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + k * 0.1 }}
                className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <BrandIcon brand={brand} className="h-5 w-5" /> <span className="text-sm">{t}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 CRMse</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 w-full max-w-md">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-brand mx-auto grid place-items-center mb-4 shadow-glow"><ShieldCheck className="w-7 h-7 text-primary-foreground" /></div>
              <h2 className="font-display text-2xl mb-2">Request received</h2>
              <p className="text-muted-foreground text-sm mb-6">Your salon account is pending admin approval. Once approved, your customised dashboard will unlock.</p>
              <Button variant="outline" onClick={() => navigate("/login")}>Back to login</Button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl mb-1">{isSignup ? "Create business ID" : "Welcome back"}</h2>
              <p className="text-muted-foreground text-sm mb-6">{isSignup ? "Register your business" : "Log in to your CRM dashboard"}</p>
              <form onSubmit={submit} className="space-y-4">
                {isSignup && (
                  <>
                    <div className="space-y-2">
                      <Label>Business type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {businessCategories.map((c) => (
                          <button type="button" key={c.id} disabled={!c.active} onClick={() => setCategory(c.id)}
                            className={cn("relative rounded-xl border p-3 text-center transition-all",
                              category === c.id ? "border-primary bg-primary/10 shadow-glow" : "border-border",
                              !c.active && "opacity-50 cursor-not-allowed")}>
                            <div className="text-2xl">{c.emoji}</div>
                            <div className="text-xs font-semibold mt-1">{c.name}</div>
                            {!c.active && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming soon</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Business name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Glow Studio" /></div>
                  </>
                )}
                <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@salon.com" /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
                <Button type="submit" disabled={loading} className="w-full bg-brand border-0 text-primary-foreground h-11 font-semibold hover:opacity-90">
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{isSignup ? "Submit for approval" : "Login"}
                </Button>
              </form>
              <p className="text-sm text-center text-muted-foreground mt-6">
                {isSignup ? "Already have an ID? " : "New business? "}
                <button className="text-primary font-semibold" onClick={() => navigate(isSignup ? "/login" : "/signup")}>{isSignup ? "Login" : "Create ID"}</button>
              </p>
              {!isSignup && <Button type="button" variant="outline" className="w-full mt-3" onClick={() => { sessionStorage.setItem("bookflow-demo", "1"); navigate("/app"); }}>Explore demo dashboard</Button>}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
