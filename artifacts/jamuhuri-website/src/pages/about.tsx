import { usePage } from "@/hooks/use-page";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { ArrowRight, Mic, BookOpen, Users, ExternalLink, CheckCircle, Loader2, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    wantsWhatsapp: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bioContent = (() => {
    const raw = aboutPage?.bodyContent;
    if (!raw) return { bio: "", vision: "", mission: "" };
    const visionMatch = raw.match(/VISION:\s*([\s\S]*?)(?=MISSION:|$)/);
    const missionMatch = raw.match(/MISSION:\s*([\s\S]*?)$/);
    const vision = visionMatch ? visionMatch[1].trim() : "";
    const mission = missionMatch ? missionMatch[1].trim() : "";
    let bio = raw.replace(/BELIEF:[\s\S]*?(?=VISION:|$)/, "");
    bio = bio.replace(/VISION:[\s\S]*?(?=MISSION:|$)/, "");
    bio = bio.replace(/MISSION:[\s\S]*$/, "");
    bio = bio.replace(/\n{2,}/g, "\n\n").trim();
    return { bio, vision, mission };
  })();

  const { mutate: subscribe, isPending } = useCreateSubscriber({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        setError(null);
      },
      onError: (err: any) => {
        if (err?.response?.status === 409) {
          setError("You are already subscribed with this email address.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    subscribe({
      data: {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        wantsWhatsapp: form.wantsWhatsapp,
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
              {aboutPage?.heroDescription || "Financial educator, author, and podcast host \u2014 on a mission to make Kenya's money markets accessible to every Kenyan."}

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
                {bioContent.bio ? (
                  bioContent.bio.split('\n\n').map((paragraph, i) => (
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

              {(bioContent.vision || bioContent.mission) && (
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {bioContent.vision && (
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#c9a227]/15 flex items-center justify-center">
                          <Target className="h-5 w-5 text-[#c9a227]" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Vision</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{bioContent.vision}</p>
                    </div>
                  )}
                  {bioContent.mission && (
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#c9a227]/15 flex items-center justify-center">
                          <Lightbulb className="h-5 w-5 text-[#c9a227]" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Mission</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{bioContent.mission}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { icon: BookOpen, label: "2 Books", sub: "Published" },
                  { icon: Mic, label: "Weekly", sub: "Podcasts" },
                  { icon: Users, label: "Growing", sub: "Community" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 rounded-xl border border-border bg-card">
                    <item.icon className="h-6 w-6 text-[#c9a227] mx-auto mb-2" />
                    <p className="font-bold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
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

      {/* Podcast Section */}
      <section className="py-24 bg-[#0f2337] text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#c9a227]/20 text-[#c9a227] text-sm font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Mic className="h-4 w-4" />
              The Podcast
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-6">
              The Market Colour Podcast
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Every week, Jamuhuri breaks down global money market trends and their direct impact on the
              Kenyan economy — in plain language that every Kenyan can understand and act on.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Global Markets",
                desc: "Analysis of US Fed policy, global bond yields, and international capital flows affecting Kenya.",
              },
              {
                title: "Kenyan Economy",
                desc: "CBK rate decisions, NSE movements, T-bill yields, and what they mean for your money.",
              },
              {
                title: "Actionable Insights",
                desc: "Practical guidance for investors, savers, and anyone trying to navigate Kenya's financial landscape.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-full bg-[#c9a227]/20 flex items-center justify-center mb-4">
                  <span className="text-[#c9a227] font-bold text-sm">0{i + 1}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <a
              href="https://marketcolourpodcast.buzzsprout.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e] font-semibold text-base px-8 py-6">
                Listen on Buzzsprout <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-serif font-bold text-foreground mb-4">
              Subscribe to the Podcast
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed">
              Get notified of new episodes by email. You can also request to join the WhatsApp discussion group —
              membership is approved personally by Jamuhuri.
            </motion.p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center"
            >
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">You are subscribed!</h3>
              <p className="text-muted-foreground">
                {form.wantsWhatsapp
                  ? "Your WhatsApp group request is pending Jamuhuri's approval. You will be contacted soon."
                  : "You will receive email updates for every new podcast episode."}
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-8 space-y-5 shadow-sm"
            >
              <div>
                <Label htmlFor="name" className="text-foreground font-medium mb-2 block">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground font-medium mb-2 block">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground font-medium mb-2 block">Phone (optional)</Label>
                <Input
                  id="phone"
                  placeholder="+254 7XX XXX XXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background">
                <Checkbox
                  id="whatsapp"
                  checked={form.wantsWhatsapp}
                  onCheckedChange={(checked) => setForm({ ...form, wantsWhatsapp: !!checked })}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="whatsapp" className="font-medium text-foreground cursor-pointer">
                    Request to join the WhatsApp Podcast Group
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Membership requires approval by Jamuhuri. You will be contacted once your request is reviewed.
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3 border border-red-100">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isPending || !form.name || !form.email}
                className="w-full bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e] font-semibold py-6 text-base"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Subscribing...</>
                ) : (
                  <>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </motion.form>
          )}
        </div>
      </section>

    </div>
  );
}

