import { usePage } from "@/hooks/use-page";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MessageSquare, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMessage } from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Contact() {
  const { data: contactPage } = usePage("contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: sendMessage, isPending } = useCreateMessage({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        setError(null);
      },
      onError: () => {
        setError("Something went wrong. Please try again or email directly.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;
    sendMessage({
      data: {
        type: "contact",
        subject: `[Contact] ${form.subject} — from ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
        senderEmail: form.email,
      },
    });
  };

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* Hero */}
      <section className="relative bg-[#0f2337] pt-24 pb-14 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80')", backgroundSize: "cover" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2337]/50 to-[#0f2337]" />
        <div className="relative z-10 container mx-auto px-6 max-w-3xl text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase mb-4">{contactPage?.heroSubtitle || "Get in Touch"}</motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
              {contactPage?.heroTitle || "Contact & Feedback"}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed">
              {contactPage?.heroDescription || "Questions about the books, podcast, or money markets? Send a message below."}</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-5 gap-16">

            {/* Left Info */}
            <div className="md:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">How to reach Jamuhuri</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0f2337] flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-[#c9a227]" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Email</p>
                      <a href="mailto:itukarua2020@gmail.com" className="text-muted-foreground hover:text-[#c9a227] transition-colors text-sm">
                        itukarua2020@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0f2337] flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-[#c9a227]" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Podcast</p>
                      <a href="https://marketcolourpodcast.buzzsprout.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#c9a227] transition-colors text-sm">
                        The Market Colour Podcast
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-10 p-6 rounded-2xl bg-[#0f2337] text-white">
                  <h3 className="font-bold mb-3">Book Enquiries</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    For bulk orders, speaking engagements, or media requests, please use the form or email directly. All book orders should be placed through the Books page.
                  </p>
                  <a href="/books" className="inline-flex items-center gap-2 text-[#c9a227] text-sm font-semibold mt-4 hover:underline">
                    Go to Books <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center"
                >
                  <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Message sent!</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. Jamuhuri will get back to you as soon as possible.
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="font-medium mb-2 block">Full Name *</Label>
                      <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-medium mb-2 block">Email *</Label>
                      <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject" className="font-medium mb-2 block">Subject *</Label>
                    <Input id="subject" placeholder="What is this about?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="message" className="font-medium mb-2 block">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your message here..."
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      className="resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3 border border-red-100">{error}</p>
                  )}
                  <Button
                    type="submit"
                    disabled={isPending || !form.name || !form.email || !form.subject || !form.message}
                    className="w-full bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e] font-semibold py-6 text-base"
                  >
                    {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : <>Send Message <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </motion.form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

