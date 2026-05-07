import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Headphones, Target, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListBooks, getListBooksQueryKey, useGetLatestPodcasts, getGetLatestPodcastsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import bookCoverImg from "@assets/An_Introduction_to_Financial_Markets_1775134561365.png";
import podcastImg from "@assets/The_Market_Color_Podcast_1775135182993.jpg";

export default function Home() {
  const { data: books } = useListBooks({ query: { queryKey: getListBooksQueryKey() } });
  const { data: podcasts } = useGetLatestPodcasts({ query: { queryKey: getGetLatestPodcastsQueryKey() } });
  const latestBooks = books ? [...books].reverse().slice(0, 3) : undefined;

  return (
    <div className="w-full">
      {/* Hero — Podcast-focused with full-width background */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center py-20 overflow-hidden bg-[#0f2337]">
        <div className="absolute inset-0 w-full h-full"><img src={podcastImg} alt="The Market Colour Podcast" className="w-full h-full object-cover object-center" /></div>
        <div className="absolute inset-0 bg-[#0f2337]/80 backdrop-blur-[2px]" />

        {/* +Follow button */}
        <a
          href="https://marketcolourpodcast.buzzsprout.com/subscribe"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 bg-[#c9a227] text-[#0f2337] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#b8911e] transition-colors shadow-lg"
        >
          <Headphones className="h-4 w-4" /> +Follow
        </a>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center w-full px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
                <Headphones className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              The Market Colour Podcast
            </h1>
            <p className="text-white/75 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
              Join Jamuhuri weekly as he breaks down complex market trends into actionable insights.
              Real talk on the NSE, CBK rates, and global shifts.
            </p>
          </motion.div>

          {/* Embedded latest episodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {!podcasts ? (
              [0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
              ))
            ) : podcasts.length === 0 ? (
              <p className="col-span-5 text-center text-white/50 py-6">No episodes available.</p>
            ) : (
              podcasts.slice(0, 5).map((podcast, i) => (
                <motion.a
                  key={podcast.id}
                  href={podcast.buzzsproutUrl || "https://marketcolourpodcast.buzzsprout.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                  className="group block bg-blue-900/30 backdrop-blur-sm border border-blue-400/20 hover:border-[#c9a227]/40 hover:bg-blue-900/40 rounded-xl p-5 text-left transition-all"
                >
                  <div className="flex items-center gap-1 mb-2 text-sm text-white/40 font-mono">
                    <span>{new Date(podcast.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{podcast.duration || "45 min"}</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white group-hover:text-[#c9a227] transition-colors line-clamp-2 mb-0.5">
                    {podcast.title}
                  </h3>
                  <p className="text-white/40 text-sm line-clamp-2">{podcast.description}</p>
                </motion.a>
              ))
            )}
          </div>

          {/* "All Episodes" link */}
          <div className="mt-6">
            <a
              href="https://marketcolourpodcast.buzzsprout.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#c9a227] font-semibold hover:underline"
            >
              All Episodes on Buzzsprout <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Belief / Vision / Mission */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: Users,
                title: "Belief",
                content: "I believe that the future of the financial markets depends on the creation of a dominant and well informed segment of retail investors.",
              },
              {
                icon: Target,
                title: "Vision",
                content: "To create a dominate class of retail investors who understand how the financial markets operate and are capable of making informed investment decisions based on reliable economic data.",
              },
              {
                icon: Lightbulb,
                title: "Mission",
                content: "To provoke and ignite awareness about the financial markets and to impart relevant knowledge that transforms retail investors and their families from consumers into active and well informed investors, with the ability to create and maintain generational wealth.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-4 rounded-xl border border-border bg-card hover:border-[#c9a227]/40 hover:shadow-lg transition-all text-center"
              >
                <div className="w-8 h-8 rounded-full bg-[#c9a227]/15 flex items-center justify-center mx-auto mb-2 group-hover:bg-[#c9a227]/25 transition-colors">
                  <item.icon className="h-4 w-4 text-[#c9a227]" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Published Works — Shrunk */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary py-1 px-3 uppercase tracking-wider font-mono text-xs">
                Publications
              </Badge>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-3">Published Works</h2>
              <p className="text-muted-foreground max-w-2xl">
                Available in two formats — physical delivery to your door, or instant E-Book.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex shrink-0 ml-4">
              <Link href="/books">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className={`grid gap-6 max-w-5xl mx-auto ${
            !latestBooks || latestBooks.length === 1
              ? "grid-cols-1 max-w-xs mx-auto"
              : latestBooks.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-3xl"
              : "grid-cols-1 md:grid-cols-3"
          }`}>
            {!latestBooks ? (
              [0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[320px] bg-muted rounded-xl animate-pulse" />
              ))
            ) : latestBooks.length === 0 ? (
              <div className="col-span-5 text-center py-16 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No books available yet.</p>
              </div>
            ) : (
              latestBooks.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col group overflow-hidden border-border/60 hover:shadow-lg hover:border-[#c9a227]/40 transition-all duration-300">
                    <div className="max-h-[280px] relative bg-gradient-to-br from-[#0f2337] to-[#1a3a5c] overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={book.coverImage || bookCoverImg}
                        alt={book.title}
                        className="object-contain w-full h-full max-h-[280px] drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {(book.type === "hardcopy" || book.type === "both") && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">Hard Copy</span>
                        )}
                        {(book.type === "ebook" || book.type === "both") && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">E-Book</span>
                        )}
                      </div>
                    </div>
                    <CardContent className="flex-1 flex flex-col p-4">
                      {book.category && (
                        <span className="text-xs font-bold tracking-wider text-primary uppercase mb-1">{book.category}</span>
                      )}
                      <h3 className="font-serif text-base font-bold mb-0.5 leading-snug">{book.title}</h3>
                      {book.subtitle && (
                        <p className="text-xs text-muted-foreground italic mb-1.5">{book.subtitle}</p>
                      )}
                      <p className="text-muted-foreground text-xs flex-1 line-clamp-2 mb-3 leading-relaxed">
                        {book.description}
                      </p>
                      <div className="border-t border-border/50 pt-3 mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">From</span>
                          <span className="font-mono font-bold text-foreground text-sm">
                            {book.hardcopyPrice
                              ? `${book.currency} ${book.hardcopyPrice.toLocaleString()}`
                              : book.ebookPrice
                              ? `${book.currency} ${book.ebookPrice.toLocaleString()}`
                              : "Contact for price"}
                          </span>
                        </div>
                        <Button asChild className="w-full bg-[#0f2337] hover:bg-[#0f2337]/90 text-white font-semibold gap-2 text-xs h-9">
                          <Link href="/books">
                            <BookOpen className="h-3.5 w-3.5" /> View & Order
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/books">View full catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}











