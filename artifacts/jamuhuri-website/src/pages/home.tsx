import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Headphones, TrendingUp, Package, Monitor } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col md:flex-row items-stretch overflow-hidden">

        {/* Left Side: Book Intro */}
        <div className="flex-1 relative flex flex-col justify-center px-8 md:px-16 py-20 bg-[#0f2337] overflow-hidden">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <img src={bookCoverImg} alt="" className="w-full h-full object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2337]/85 via-[#0f2337]/75 to-[#0f2337]/50" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-2xl"
          >
            <Badge variant="outline" className="text-[#c9a227] border-[#c9a227]/50 mb-6 py-1 px-3 uppercase tracking-wider font-mono text-xs">
              Latest Release
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Introduction to <span className="text-[#c9a227] italic">Money Markets</span>
            </h1>
            <p className="text-white/75 text-lg md:text-xl mb-10 leading-relaxed">
              A comprehensive guide to understanding the global financial system and how it shapes the Kenyan economy. Demystifying bonds, T-bills, and interest rates for the everyday investor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e] font-bold">
                <Link href="/books">Order Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto text-white border-white/30 hover:bg-white/10 hover:text-white">
                <Link href="/about">About the Author</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Podcast Intro */}
        <div className="flex-1 relative flex flex-col justify-center px-8 md:px-16 py-20 overflow-hidden">
          <div className="absolute inset-0">
            <img src={podcastImg} alt="The Market Colour Podcast" className="w-full h-full object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-[#0f2337]/80 backdrop-blur-[2px]" />
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 max-w-xl mx-auto w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
                <Headphones className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white">The Market Colour</h2>
            </div>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Join Jamuhuri weekly as he breaks down complex market trends into actionable insights. Real talk on the NSE, CBK rates, and global shifts.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md">
              <div className="mb-4">
                <h3 className="font-bold text-white mb-1">Latest Episode</h3>
                <p className="text-sm text-white/60">Listen to the latest market insights</p>
              </div>
              <a
                href="https://marketcolourpodcast.buzzsprout.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-[#c9a227] text-[#0f2337] py-4 rounded-lg font-bold hover:bg-[#b8911e] transition-colors"
              >
                Listen on Buzzsprout <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Published Works — now BEFORE Latest Episodes */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary py-1 px-3 uppercase tracking-wider font-mono text-xs">
                Publications
              </Badge>
              <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Published Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Available in two formats — physical delivery to your door, or instant digital copy sent to your inbox.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex shrink-0 ml-4">
              <Link href="/books">View All Books <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className={`grid gap-8 max-w-5xl mx-auto ${
            !latestBooks || latestBooks.length === 1
              ? "grid-cols-1 max-w-sm"
              : latestBooks.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-3xl"
              : "grid-cols-1 md:grid-cols-3"
          }`}>
            {!latestBooks ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="h-[440px] bg-muted rounded-xl animate-pulse" />
              ))
            ) : latestBooks.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
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
                    <div className="aspect-[3/4] relative bg-gradient-to-br from-[#0f2337] to-[#1a3a5c] overflow-hidden flex items-center justify-center p-6">
                      <img
                        src={book.coverImage || bookCoverImg}
                        alt={book.title}
                        className="object-contain w-full h-full drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        {(book.type === "hardcopy" || book.type === "both") && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">Hard Copy</span>
                        )}
                        {(book.type === "ebook" || book.type === "both") && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Digital</span>
                        )}
                      </div>
                    </div>
                    <CardContent className="flex-1 flex flex-col p-6">
                      {book.category && (
                        <span className="text-xs font-bold tracking-wider text-primary uppercase mb-1">{book.category}</span>
                      )}
                      <h3 className="font-serif text-lg font-bold mb-1 leading-snug">{book.title}</h3>
                      {book.subtitle && (
                        <p className="text-sm text-muted-foreground italic mb-2">{book.subtitle}</p>
                      )}
                      <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-4 leading-relaxed">
                        {book.description}
                      </p>
                      <div className="border-t border-border/50 pt-4 mt-auto">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground">From</span>
                          <span className="font-mono font-bold text-foreground">
                            {book.hardcopyPrice
                              ? `${book.currency} ${book.hardcopyPrice.toLocaleString()}`
                              : book.ebookPrice
                              ? `${book.currency} ${book.ebookPrice.toLocaleString()}`
                              : "Contact for price"}
                          </span>
                        </div>
                        <Button asChild className="w-full bg-[#0f2337] hover:bg-[#0f2337]/90 text-white font-semibold gap-2 text-sm">
                          <Link href="/books">
                            <BookOpen className="h-4 w-4" /> View & Order
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/books">View full catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Episodes — now AFTER Published Works */}
      <section className="py-24 bg-[#0f2337]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="text-[#c9a227] border-[#c9a227]/40 mb-4 py-1 px-3 uppercase tracking-wider font-mono text-xs">
              The Market Colour Podcast
            </Badge>
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Latest Episodes</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Tune into recent episodes for timely analysis and commentary on global and Kenyan markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {!podcasts ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="h-56 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
              ))
            ) : podcasts.length === 0 ? (
              <p className="col-span-3 text-center text-white/50 py-12">No episodes available yet.</p>
            ) : (
              podcasts.map((podcast, i) => (
                <motion.div
                  key={podcast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <a
                    href={podcast.buzzsproutUrl || "https://marketcolourpodcast.buzzsprout.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group h-full"
                  >
                    <Card className="h-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#c9a227]/40 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-xs text-white/50 font-mono">
                          <span>{new Date(podcast.publishedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{podcast.duration || "45 min"}</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold mb-3 text-white group-hover:text-[#c9a227] transition-colors">
                          {podcast.title}
                        </h3>
                        <p className="text-white/60 text-sm line-clamp-3 mb-6">
                          {podcast.description}
                        </p>
                        <div className="flex items-center text-[#c9a227] font-semibold text-sm">
                          Listen Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
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

      {/* Markets Teaser */}
      <section className="py-24 bg-white border-y border-border/30 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">Market Insights</Badge>
            <h2 className="text-4xl font-serif font-bold text-foreground mb-6">Navigating Global & Kenyan Markets</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              The financial landscape is interconnected. Understanding how global interest rates, inflation, and bond yields affect the Kenyan Shilling and local markets is crucial for strategic decision-making.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-background rounded-xl border border-border/50">
                <TrendingUp className="h-8 w-8 text-primary mb-4" />
                <h4 className="font-bold mb-2">Macro Trends</h4>
                <p className="text-sm text-muted-foreground">Analysis of CBK monetary policy and inflation data.</p>
              </div>
              <div className="p-6 bg-background rounded-xl border border-border/50">
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h4 className="font-bold mb-2">Educational Resources</h4>
                <p className="text-sm text-muted-foreground">Deep dives into terminology and market mechanics.</p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href="/markets">Explore Money Markets</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-20 bg-secondary text-secondary-foreground text-center border-t border-white/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-serif font-bold text-white mb-8">How to Order Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-primary mb-4">Hardcopy Editions</h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">1.</span> Select your book and fill out the delivery details.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">2.</span> Pay conveniently on delivery via M-PESA.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">3.</span> Shipping charges are extra and depend on courier rates to your location.
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-primary mb-4">E-Book Editions</h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">1.</span> Select the e-book version and provide your email.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">2.</span> Complete the secure payment process.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">3.</span> Receive your high-quality digital copy instantly via email.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
