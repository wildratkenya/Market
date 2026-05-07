import { usePage } from "@/hooks/use-page";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ArrowRight, Mic, BookOpen, Users, CheckCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSubscriber } from "@workspace/api-client-react";
import authorPhoto from "@assets/Jamuhuri-Gachoroba_Author_1775134573954.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function About() {
  const { data: aboutPage } = usePage("about");
  const bioContent = aboutPage?.bodyContent ?? "";
  const [newsletterForm, setNewsletterForm] = useState({ name: "", email: "" });
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const [podcastCount, setPodcastCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://rss.buzzsprout.com/1999543.rss", {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
      .then((res) => res.text())
      .then((xml) => {
        const matches = xml.match(/<item>/g);
        setPodcastCount(matches ? matches.length : 202);
      })
      .catch(() => setPodcastCount(202));
  }, []);

  const { mutate: newsletterSub, isPending: newsletterPending } = useCreateSubscriber({
    mutation: {
      onSuccess: () => {
        setNewsletterSubmitted(true);
        setNewsletterError(null);
      },
      onError: (err: any) => {
        if (err?.response?.status === 409) {
          setNewsletterError("Already subscribed with this email.");
        } else {
          setNewsletterError("Something went wrong. Please try again.");
        }
      },
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterForm.name || !newsletterForm.email) return;
    newsletterSub({
      data: {
        name: newsletterForm.name,
        email: newsletterForm.email,
        phone: null,
        wantsWhatsapp: false,
      }
    });
  };

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[35vh] bg-[#0f2337] flex items-end pb-8 pt-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2337]/60 via-[#0f2337]/80 to-[#0f2337]" />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase mb-4">
              {aboutPage?.heroSubtitle || "About the Author"}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-6"
            >
              {aboutPage?.heroTitle || "Jamuhuri Gachoroba"}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
              {aboutPage?.heroDescription || "Financial educator, author, and podcast host — on a mission to make Kenya's money markets accessible to every Kenyan."}

            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="md:sticky md:top-8"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#0f2337] relative shadow-lg">
                <img
                  src={authorPhoto}
                  alt="Jamuhuri Gachoroba"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2337]/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-serif text-xl font-bold">Jamuhuri Gachoroba</p>
                  <p className="text-[#c9a227] text-sm">Financial Expert & Author</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon: BookOpen, label: "2", sub: "Books" },
                  { icon: Mic, label: podcastCount ?? "...", sub: "Podcasts" },
                  { icon: Users, label: "Growing", sub: "Community" },
                ].map((item) => (
                  <div key={item.sub} className="text-center p-3 rounded-xl border border-border bg-card">
                    <item.icon className="h-5 w-5 text-[#c9a227] mx-auto mb-1.5" />
                    <p className="font-bold text-foreground text-sm">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-[#c9a227]" />
                  <h3 className="text-sm font-bold text-foreground">Subscribe to Newsletter</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Get updates directly to your inbox.</p>
                {newsletterSubmitted ? (
                  <div className="text-center py-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-green-600 font-medium">You are subscribed!</p>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                    <Input placeholder="Your name" value={newsletterForm.name} onChange={(e) => setNewsletterForm({ ...newsletterForm, name: e.target.value })} required className="bg-background text-sm h-8" />
                    <Input type="email" placeholder="your@email.com" value={newsletterForm.email} onChange={(e) => setNewsletterForm({ ...newsletterForm, email: e.target.value })} required className="bg-background text-sm h-8" />
                    {newsletterError && <p className="text-xs text-red-500">{newsletterError}</p>}
                    <Button type="submit" disabled={newsletterPending || !newsletterForm.name || !newsletterForm.email} className="w-full bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e] text-sm h-8">
                      {newsletterPending ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Subscribing...</> : <>Subscribe <ArrowRight className="ml-1 h-3 w-3" /></>}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
                A Voice for Financial Literacy in Kenya
              </h2>
              <div className="mb-12 md:columns-2 md:gap-8 [&>p]:mb-4 [&>p]:break-inside-avoid text-muted-foreground leading-relaxed">
                {bioContent ? (
                  bioContent.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="whitespace-pre-line">{paragraph}</p>
                  ))
                ) : (
                  <>
                    <p>
                      Jamuhuri Gachoroba is one of Kenya's foremost voices on financial market education.
                      With years of experience studying and analyzing both global and local financial markets,
                      he has dedicated his career to breaking down complex financial concepts for ordinary Kenyans.
                    </p>
                    <p>
                      His work bridges the gap between sophisticated financial theory and everyday economic reality —
                      helping readers and listeners understand how decisions made in Washington, London, and Beijing
                      ripple through to prices in Nairobi's markets.
                    </p>
                    <p>
                      Through his books and weekly podcast, Jamuhuri has built a growing community of financially
                      conscious Kenyans who are equipped to make better decisions about savings, investments,
                      and understanding the macroeconomic forces shaping their lives.
                    </p>
                  </>
                )}
              </div>

              <Link href="/books">
                <Button className="bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e] font-semibold">
                  Explore the Books <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
}
