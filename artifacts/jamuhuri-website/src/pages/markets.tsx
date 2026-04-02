import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, BarChart3, Globe, DollarSign, Percent, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListPodcasts, getListPodcastsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const marketData = [
  { label: "CBK Base Rate", value: "13.00%", trend: "stable", note: "Central Bank of Kenya" },
  { label: "91-Day T-Bill", value: "~15.8%", trend: "up", note: "Latest auction yield" },
  { label: "182-Day T-Bill", value: "~16.2%", trend: "up", note: "Latest auction yield" },
  { label: "364-Day T-Bill", value: "~16.5%", trend: "up", note: "Latest auction yield" },
  { label: "USD/KES", value: "~130", trend: "stable", note: "Indicative rate" },
  { label: "NASI Index", value: "~138", trend: "up", note: "Nairobi Securities Exchange" },
];

const topics = [
  {
    icon: Globe,
    title: "Global Money Markets",
    desc: "Money markets are short-term financial markets where institutions borrow and lend for periods of up to one year. They include instruments like Treasury Bills, commercial paper, certificates of deposit, and repurchase agreements. Understanding global money markets is essential for any investor because capital flows between markets affect interest rates, exchange rates, and ultimately the cost of living in Kenya.",
  },
  {
    icon: TrendingUp,
    title: "Kenyan Money Markets",
    desc: "Kenya's money market is primarily centered around the Central Bank of Kenya's open market operations. The CBK issues Treasury Bills weekly — 91-day, 182-day, and 364-day — which set the benchmark for all other short-term lending rates. Commercial banks, institutional investors, and increasingly retail investors can participate through mobile money platforms and fund managers.",
  },
  {
    icon: Percent,
    title: "Interest Rates & Monetary Policy",
    desc: "The CBK Monetary Policy Committee meets every two months to review the Central Bank Rate (CBR). Changes to the CBR ripple through the entire economy — affecting mortgage rates, business loans, government borrowing costs, and the returns available to savers. Understanding these mechanisms helps Kenyans make smarter decisions about when to borrow and when to save.",
  },
  {
    icon: BarChart3,
    title: "Bond Markets",
    desc: "Kenya's bond market includes both government securities (infrastructure bonds, treasury bonds) and a small but growing corporate bond market listed on the NSE. Government bonds offer fixed coupon rates over longer periods — from 2 years to 25 years — and are considered very low risk. The Fixed Income Securities Market Segment (FISMS) at the NSE provides a secondary market for trading these instruments.",
  },
  {
    icon: DollarSign,
    title: "Foreign Exchange Markets",
    desc: "The KES/USD exchange rate is one of the most watched financial indicators in Kenya. It affects the cost of imports, inflation, and the returns on foreign investments. Kenya operates a managed float regime where the CBK intervenes to smooth excessive volatility. Tracking the KES against major currencies is essential for understanding Kenya's external sector dynamics.",
  },
  {
    icon: TrendingUp,
    title: "NSE Equities Market",
    desc: "The Nairobi Securities Exchange lists over 60 companies across multiple sectors. The NSE All Share Index (NASI) tracks overall market performance. While less liquid than developed markets, the NSE provides Kenyans with access to equity investments in banking, telecommunications, energy, and consumer goods companies. Understanding price-earnings ratios, dividends, and trading volumes helps investors navigate this market.",
  },
];

export default function Markets() {
  const { data: podcasts } = useListPodcasts({ query: { queryKey: getListPodcastsQueryKey() } });

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[60vh] bg-[#0f2337] flex items-end pb-16 pt-36 overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2337]/60 via-[#0f2337]/80 to-[#0f2337]" />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase mb-4">
              Financial Education
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Global & Kenyan<br />
              <span className="text-[#c9a227] italic">Money Markets</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-2xl leading-relaxed">
              Understanding the financial forces that shape Kenya's economy — from the US Federal Reserve
              to the CBK, from Wall Street to the Nairobi Securities Exchange.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Market Data Strip */}
      <section className="bg-[#0f2337] border-t border-white/10 py-6">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {marketData.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-white/50 text-xs mb-1">{item.label}</p>
                <p className="text-[#c9a227] font-bold text-lg">{item.value}</p>
                <p className="text-white/30 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-4">Indicative rates for educational purposes only. Not financial advice.</p>
        </div>
      </section>

      {/* Market Education Topics */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Understanding the Markets
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Core concepts every Kenyan investor and financial citizen should know.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {topics.map((topic, i) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0f2337] flex items-center justify-center mb-5">
                  <topic.icon className="h-6 w-6 text-[#c9a227]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{topic.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{topic.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Podcast Episodes */}
      {podcasts && podcasts.length > 0 && (
        <section className="py-24 bg-[#f7f5f0]">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <motion.h2 variants={fadeUp} className="text-4xl font-serif font-bold text-foreground mb-2">
                  Market Analysis Episodes
                </motion.h2>
                <motion.p variants={fadeUp} className="text-muted-foreground">
                  Deep dives into market trends from The Market Colour Podcast
                </motion.p>
              </div>
              <a href="https://marketcolourpodcast.buzzsprout.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="hidden md:flex">
                  All Episodes <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </motion.div>

            <div className="space-y-4">
              {podcasts.slice(0, 5).map((ep, i) => (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-6 p-6 rounded-2xl bg-background border border-border hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0f2337] flex items-center justify-center shrink-0">
                    <span className="text-[#c9a227] font-bold text-sm">#{ep.episodeNumber ?? i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground truncate">{ep.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {ep.duration ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ep.publishedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ep.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  {ep.buzzsproutUrl && (
                    <a href={ep.buzzsproutUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="shrink-0 bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e]">
                        Listen
                      </Button>
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA to Books */}
      <section className="py-24 bg-[#0f2337] text-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Go Deeper with the Books
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Jamuhuri's books provide the comprehensive frameworks for understanding money markets —
              both globally and in the Kenyan context.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/books">
                <Button size="lg" className="bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e] font-semibold text-base px-10 py-6">
                  Order the Books <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}