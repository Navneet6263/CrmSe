import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Cloud, ArrowRight, ChevronRight, FileText, Calendar, Users, Zap, Globe, Lock, Sparkles, Home, FolderOpen, Clock, Star, Share2, Trash2, Search, User, Upload, Folder, Settings, Bell, ChevronDown, FolderPlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Feature197 } from "@/components/ui/accordion-feature-section";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Testimonials } from "@/components/ui/testimonials-columns";
import cloudlyFiles from "@/assets/cloudly-files.png";
import cloudlyCalendar from "@/assets/cloudly-calendar.png";
import cloudlyTeam from "@/assets/cloudly-team.png";
import heroDashboardFrame from "@/assets/hero-dashboard-frame.png";
import heroCloudsBg from "@/assets/hero-clouds-bg.png";
const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5
      }
    }
  }
};
const trustedCompanies = ["Nvidia", "Figma", "Pixar", "Spotify", "Stripe", "Toyota", "Headspace"];
const accordionFeatures = [{
  id: 1,
  title: "Files & Docs",
  image: cloudlyFiles,
  description: "Store any file, create rich docs, and keep everything organized in one workspace. Drag and drop uploads, instant previews, and seamless sharing."
}, {
  id: 2,
  title: "Calendar & Scheduling",
  image: cloudlyCalendar,
  description: "Built-in calendar to track deadlines and file schedules across your team. Never miss an important date with smart reminders and notifications."
}, {
  id: 3,
  title: "Team Spaces",
  image: cloudlyTeam,
  description: "Dedicated spaces for every team. Marketing, Engineering, Design—all in one place. Collaborate in real-time with granular permissions."
}];
const testimonials = [{
  text: "Cloudly revolutionized how our team handles documents. Everything is organized and accessible from anywhere.",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  name: "Sarah Chen",
  role: "Product Manager"
}, {
  text: "The collaboration features are incredible. We reduced our meeting time by 40% just by sharing files more efficiently.",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  name: "Marcus Johnson",
  role: "Engineering Lead"
}, {
  text: "Finally, a file management tool that actually makes sense. The AI search is a game-changer for our legal team.",
  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  name: "Emily Rodriguez",
  role: "Legal Counsel"
}, {
  text: "We migrated from three different tools to Cloudly. Best decision we made this year.",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  name: "David Park",
  role: "CTO"
}, {
  text: "The security features give us peace of mind. Enterprise-grade protection without the enterprise complexity.",
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  name: "Olivia Martinez",
  role: "Security Director"
}, {
  text: "Our remote team feels more connected than ever. Cloudly made async collaboration actually work.",
  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  name: "James Wilson",
  role: "Operations Manager"
}, {
  text: "The onboarding was seamless. Our whole team was up and running in less than a day.",
  image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
  name: "Anna Thompson",
  role: "HR Director"
}, {
  text: "Customer support is phenomenal. They helped us set up custom workflows that saved hours each week.",
  image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
  name: "Michael Lee",
  role: "Customer Success"
}, {
  text: "The mobile app is just as powerful as desktop. I can approve documents from anywhere now.",
  image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  name: "Rachel Kim",
  role: "CEO"
}];
const features = [{
  icon: FileText,
  title: "Files & Docs",
  description: "Store any file, create rich docs, and keep everything organized in one workspace."
}, {
  icon: Calendar,
  title: "Calendar",
  description: "Built-in calendar to track deadlines and file schedules across your team."
}, {
  icon: Users,
  title: "Team spaces",
  description: "Dedicated spaces for every team. Marketing, Engineering, Design—all in one place."
}];
const bentoFeatures = [{
  Icon: FolderOpen,
  name: "Organize Everything",
  description: "Smart folders, customizable tags, and powerful search to keep all your files perfectly organized and instantly accessible.",
  href: "/signup",
  cta: "Get started",
  className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2"
}, {
  Icon: Share2,
  name: "Share Securely",
  description: "Secure links with granular permissions.",
  href: "/signup",
  cta: "Learn more",
  className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
}, {
  Icon: Users,
  name: "Team Collaboration",
  description: "Real-time collaboration on any file.",
  href: "/signup",
  cta: "Learn more",
  className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3"
}, {
  Icon: Lock,
  name: "Enterprise Security",
  description: "Bank-level encryption and compliance.",
  href: "/signup",
  cta: "Learn more",
  className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
}, {
  Icon: Zap,
  name: "Lightning Fast",
  description: "Instant uploads, previews, and search.",
  href: "/signup",
  cta: "Try it now",
  className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3"
}];
export default function Landing() {
  return <div className="overflow-hidden bg-background">
      {/* Hero Section */}
      {/* Pull hero background behind the fixed navbar (navbar lives in PublicLayout) */}
      <section className="relative overflow-hidden -mt-16 pt-16">
        {/* Realistic Cloud Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src={heroCloudsBg} 
            alt="" 
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-70 dark:opacity-40"
          />
          {/* Top cloud accents */}
          <div className="absolute left-1/4 -top-20 w-[600px] h-[400px] bg-gradient-radial from-white/50 via-white/25 to-transparent rounded-full blur-3xl dark:from-white/25 dark:via-white/12" />
          <div className="absolute right-1/4 -top-16 w-[500px] h-[350px] bg-gradient-radial from-white/45 via-white/20 to-transparent rounded-full blur-3xl dark:from-white/22 dark:via-white/10" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-[700px] h-[300px] bg-gradient-radial from-white/40 via-white/20 to-transparent rounded-full blur-2xl dark:from-white/20 dark:via-white/10" />
          {/* Left side cloud accent */}
          <div className="absolute -left-32 -top-10 w-[450px] h-[400px] bg-gradient-radial from-white/55 via-white/28 to-transparent rounded-full blur-3xl dark:from-white/28 dark:via-white/14" />
          <div className="absolute -left-32 top-20 w-[500px] h-[500px] bg-gradient-radial from-white/60 via-white/30 to-transparent rounded-full blur-3xl dark:from-white/30 dark:via-white/15" />
          <div className="absolute -left-16 top-40 w-96 h-96 bg-gradient-radial from-white/50 via-white/25 to-transparent rounded-full blur-2xl dark:from-white/25 dark:via-white/10" />
          <div className="absolute left-10 top-64 w-72 h-72 bg-gradient-radial from-white/40 via-white/20 to-transparent rounded-full blur-xl dark:from-white/20 dark:via-white/8" />
          {/* Right side cloud accent */}
          <div className="absolute -right-32 -top-10 w-[450px] h-[400px] bg-gradient-radial from-white/55 via-white/28 to-transparent rounded-full blur-3xl dark:from-white/28 dark:via-white/14" />
          <div className="absolute -right-32 top-24 w-[500px] h-[500px] bg-gradient-radial from-white/60 via-white/30 to-transparent rounded-full blur-3xl dark:from-white/30 dark:via-white/15" />
          <div className="absolute -right-16 top-48 w-96 h-96 bg-gradient-radial from-white/50 via-white/25 to-transparent rounded-full blur-2xl dark:from-white/25 dark:via-white/10" />
          <div className="absolute right-10 top-72 w-72 h-72 bg-gradient-radial from-white/40 via-white/20 to-transparent rounded-full blur-xl dark:from-white/20 dark:via-white/8" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent via-50% to-muted" />
        </div>

        <div className="relative pt-24 md:pt-[96px] overflow-x-hidden">
          <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]" />
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
              <AnimatedGroup variants={transitionVariants}>
                {/* Announcement badge */}
                <Link to="/webinar" className="group mx-auto flex w-fit items-center gap-2.5 rounded-full border border-border bg-muted dark:bg-muted/50 px-4 py-1.5 transition-all duration-300 hover:bg-accent dark:hover:bg-muted hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-primary font-medium text-sm">Live Demo Webinar</span>
                  <ChevronRight className="size-4 text-primary" />
                </Link>

                {/* Main Headline */}
                <h1 className="mt-8 text-balance text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  <span className="block">Everything you need,</span>
                  <span className="block mt-2">All in one place.</span>
                </h1>

                {/* Description */}
                <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
                  Cloudly is the connected workspace where better, faster work happens. Store, share, and collaborate on files with your team.
                </p>

                {/* CTA Buttons */}
                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button size="lg" className="h-11 px-6 text-base bg-black hover:bg-black/90" asChild>
                    <Link to="/signup">
                      <span className="text-nowrap">Get Cloudly free</span>
                    </Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="h-11 px-6 text-base bg-muted hover:bg-muted/80 text-foreground" asChild>
                    <Link to="/pricing">
                      <span className="text-nowrap">Request a demo</span>
                    </Link>
                  </Button>
                </div>
              </AnimatedGroup>

              {/* Hero Image/Screenshot */}
              <AnimatedGroup variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75
                  }
                }
              },
              ...transitionVariants
            }}>
                {/* Exact uploaded screenshot */}
                <div className="relative mx-auto mt-16 sm:mt-20 w-full max-w-5xl md:max-w-[92vw] lg:max-w-6xl xl:max-w-7xl">
                  <img
                    src={heroDashboardFrame}
                    alt="Cloudly dashboard in a browser frame"
                    loading="lazy"
                    className="h-auto w-full rounded-2xl border border-border/60 shadow-2xl shadow-foreground/5"
                  />
                </div>
              </AnimatedGroup>
            </div>
          </div>

          {/* Logo Cloud */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="mx-auto mt-20 mb-8 max-w-5xl px-6">
            <div className="flex flex-col items-center">
              <p className="text-muted-foreground text-sm font-medium mb-8">
                Meet Our Customers
              </p>
              <div className="flex items-center justify-center flex-wrap gap-x-12 gap-y-8">
                {[{
                src: "https://cdn.worldvectorlogo.com/logos/nvidia-image-logo.svg",
                alt: "Nvidia",
                height: "h-8"
              }, {
                src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
                alt: "Figma",
                height: "h-6"
              }, {
                src: "https://cdn.worldvectorlogo.com/logos/samsung-8.svg",
                alt: "Samsung",
                height: "h-5"
              }, {
                src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg",
                alt: "Spotify",
                height: "h-7"
              }, {
                src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
                alt: "Stripe",
                height: "h-8"
              }, {
                src: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg",
                alt: "Shopify",
                height: "h-7"
              }, {
                src: "/logos/google.svg",
                alt: "Google",
                height: "h-8"
              }].map((logo, index) => <motion.img key={logo.alt} src={logo.src} alt={logo.alt} className={`${logo.height} w-auto opacity-60 hover:opacity-80 transition-opacity grayscale`} initial={{
                opacity: 0,
                y: 10
              }} whileInView={{
                opacity: 0.6,
                y: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.4,
                delay: 0.3 + index * 0.1
              }} whileHover={{
                opacity: 0.8,
                scale: 1.05
              }} />)}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Bento Grid Section */}
      <section id="features" className="py-20 lg:py-28 bg-muted/40 dark:bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Everything you need
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A complete toolkit for modern file management and team collaboration.
              </p>
            </motion.div>
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }}>
              <BentoGrid className="">
                {bentoFeatures.map(feature => <BentoCard key={feature.name} {...feature} />)}
              </BentoGrid>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Accordion */}
      <Feature197 features={accordionFeatures} title="Upload & Share with your team" description="Powerful features to help your team work smarter, not harder." />

      {/* Testimonials Section */}
      <Testimonials title="Testimonials" subtitle="Loved by teams worldwide" description="See what our customers have to say about their experience with Cloudly." testimonials={testimonials} />

      {/* Final CTA */}
      <section className="py-24 lg:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-background/50 uppercase tracking-widest mb-4">
              Ready to get started?
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-background tracking-tight mb-6">
              Simplify your workflow
            </h2>
            <p className="text-lg sm:text-xl text-background/60 mb-12 max-w-xl mx-auto leading-relaxed">
              Join thousands of teams who trust Cloudly for secure, seamless file management.
            </p>

            <Button size="lg" className="h-11 px-10 text-base font-semibold bg-background text-foreground hover:bg-background/90 shadow-lg shadow-background/20" asChild>
              <Link to="/signup">
                Start for free
              </Link>
            </Button>
            
            <p className="mt-8 text-sm text-background/40">
              No credit card required · Free 14-day trial · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>;
}