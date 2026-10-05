import { useState } from "react";
import { motion } from "framer-motion";
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  FileText, 
  Shield, 
  CreditCard,
  Users,
  Folder,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

const faqCategories = [
  {
    name: "Getting Started",
    icon: FileText,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click 'Get Cloudly free' on our homepage, enter your email and create a password. You'll receive a confirmation email to verify your account.",
      },
      {
        q: "What file types can I upload?",
        a: "Cloudly supports all common file types including documents (PDF, DOC, DOCX), images (JPG, PNG, GIF), videos (MP4, MOV), and many more. There are no restrictions on file types.",
      },
      {
        q: "How do I upload files?",
        a: "Simply drag and drop files into your Cloudly dashboard, or click the upload button to select files from your device. You can upload multiple files at once.",
      },
    ],
  },
  {
    name: "Storage & Plans",
    icon: CreditCard,
    questions: [
      {
        q: "How much storage do I get for free?",
        a: "Our free plan includes 5 GB of storage, which is perfect for personal use and getting started with Cloudly.",
      },
      {
        q: "Can I upgrade my plan at any time?",
        a: "Yes! You can upgrade to Pro (2 TB) or Business (Unlimited) at any time from your account settings. Changes take effect immediately.",
      },
      {
        q: "What happens if I exceed my storage limit?",
        a: "You'll receive notifications when approaching your limit. Once reached, you won't be able to upload new files until you upgrade or delete existing files.",
      },
    ],
  },
  {
    name: "Sharing & Collaboration",
    icon: Users,
    questions: [
      {
        q: "How do I share files with others?",
        a: "Select any file, click the share button, and enter the email address of the person you want to share with. You can set view-only or edit permissions.",
      },
      {
        q: "Can I share files with non-Cloudly users?",
        a: "Yes! You can generate a public link that anyone can use to view or download the file, even without a Cloudly account.",
      },
      {
        q: "How do team folders work?",
        a: "Pro users get 3 team folders, Business users get unlimited. Team folders allow multiple users to access and collaborate on the same set of files.",
      },
    ],
  },
  {
    name: "Security & Privacy",
    icon: Shield,
    questions: [
      {
        q: "Is my data encrypted?",
        a: "Yes, all files are encrypted both in transit (TLS 1.3) and at rest (AES-256). Your data security is our top priority.",
      },
      {
        q: "Can I enable two-factor authentication?",
        a: "Absolutely! Go to Settings > Security to enable 2FA. We support authenticator apps and backup codes for account recovery.",
      },
      {
        q: "Who can access my files?",
        a: "Only you can access your files unless you explicitly share them. Our team cannot view your files without your permission.",
      },
    ],
  },
  {
    name: "File Management",
    icon: Folder,
    questions: [
      {
        q: "How do I recover deleted files?",
        a: "Deleted files go to Trash and stay there for 30 days. You can restore them anytime during this period from the Trash section.",
      },
      {
        q: "Is there version history?",
        a: "Yes! Free plans get 7 days of version history, Pro gets 180 days, and Business gets unlimited. Access previous versions from the file details.",
      },
      {
        q: "Can I organize files into folders?",
        a: "Yes, you can create unlimited folders and subfolders to organize your files however you like.",
      },
    ],
  },
];

const helpResources = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Detailed guides and tutorials",
    link: "#",
  },
  {
    icon: MessageSquare,
    title: "Community Forum",
    description: "Connect with other users",
    link: "#",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our team",
    link: "#contact",
  },
];

export default function HelpCenter() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
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
    
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions or get in touch with our support team.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20"
        >
          {helpResources.map((resource) => (
            <a
              key={resource.title}
              href={resource.link}
              className="group flex flex-col items-center p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <resource.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {resource.description}
              </p>
            </a>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqCategories.map((category) => (
              <div
                key={category.name}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 bg-muted/50 border-b border-border">
                  <category.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                </div>
                <Accordion type="single" collapsible className="px-2">
                  {category.questions.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.name}-${index}`}
                      className="border-b-0"
                    >
                      <AccordionTrigger className="px-4 py-4 text-left hover:no-underline hover:bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium text-foreground">
                          {item.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          id="contact"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Still need help?
            </h2>
            <p className="text-muted-foreground">
              Send us a message and we'll get back to you within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleInputChange}
                className={errors.subject ? "border-destructive" : ""}
              />
              {errors.subject && (
                <p className="text-xs text-destructive">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe your issue or question..."
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                className={errors.message ? "border-destructive" : ""}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}