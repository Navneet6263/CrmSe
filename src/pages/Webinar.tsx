import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Video, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email is too long"),
  company: z.string().trim().max(100, "Company name is too long").optional(),
});

export default function Webinar() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsRegistered(true);
    toast.success("You're registered! Check your email for details.");
  };

  const webinarDetails = {
    title: "Cloudly Live Demo: Master Your Files",
    date: "Friday, February 7, 2025",
    time: "2:00 PM EST",
    duration: "45 minutes",
    spots: "Limited to 100 attendees",
  };

  const whatYouLearn = [
    "How to organize files with smart folders and tags",
    "Secure sharing with granular permissions",
    "Real-time collaboration with your team",
    "AI-powered search and document insights",
    "Q&A session with our product team",
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-foreground">Live Event</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {webinarDetails.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Join us for an exclusive live demonstration of Cloudly's powerful features. 
                See how leading teams are transforming their file management workflow.
              </p>

              {/* Event Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{webinarDetails.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{webinarDetails.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Video className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{webinarDetails.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="font-medium text-foreground">{webinarDetails.spots}</p>
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">What you'll learn</h2>
                <ul className="space-y-3">
                  {whatYouLearn.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right: Signup Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="sticky top-8 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-lg">
                {!isRegistered ? (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Reserve your spot
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Fill out the form below to register for the webinar. You'll receive a confirmation email with the event link.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Work email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company name (optional)</Label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Acme Inc."
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({ ...formData, company: e.target.value })
                          }
                          className={errors.company ? "border-destructive" : ""}
                        />
                        {errors.company && (
                          <p className="text-sm text-destructive">{errors.company}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 text-base bg-black hover:bg-black/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Registering..." : "Register for free"}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By registering, you agree to receive emails about this event. You can unsubscribe at any time.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      You're registered!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Check your inbox for a confirmation email with the webinar link and calendar invite.
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/">Back to homepage</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
