import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Headphones, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListBooks, getListBooksQueryKey, useGetLatestPodcasts, getGetLatestPodcastsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: books } = useListBooks({ query: { queryKey: getListBooksQueryKey() } });
  const { data: podcasts } = useGetLatestPodcasts({ query: { queryKey: getGetLatestPodcastsQueryKey() } });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col md:flex-row items-stretch bg-secondary overflow-hidden">
        {/* Background Image with overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'url(/images/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        
        {/* Left Side: Book Intro */}
        <div className="flex-1 z-10 flex flex-col justify-center px-8 md:px-16 py-20 border-r border-secondary-border/30">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge variant="outline" className="text-primary border-primary/50 mb-6 py-1 px-3 uppercase tracking-wider font-mono text-xs">
              Latest Release
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Introduction to <span className="text-primary italic">Money Markets</span>
            </h1>
            <p className="text-secondary-foreground/80 text-lg md:text-xl mb-10 leading-relaxed">
              A comprehensive guide to understanding the global financial system and how it shapes the Kenyan economy. Demystifying bonds, T-bills, and interest rates for the everyday investor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                <Link href="/books">Order Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto text-white border-white/20 hover:bg-white/10 hover:text-white">
                <Link href="/about">About the Author</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Podcast Intro */}
        <div className="flex-1 z-10 flex flex-col justify-center px-8 md:px-16 py-20 bg-secondary/95 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl mx-auto w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Headphones className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white">The Market Colour</h2>
            </div>
            <p className="text-secondary-foreground/80 text-lg mb-8 leading-relaxed">
              Join Jamuhuri weekly as he breaks down complex market trends into actionable insights. Real talk on the NSE, CBK rates, and global shifts.
            </p>
            
            {/* Embedded Player Placeholder/Link */}
            <div className="bg-background/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white mb-1">Latest Episode</h3>
                  <p className="text-sm text-secondary-foreground/60">Listen to the latest market insights</p>
                </div>
              </div>
              <a 
                href="https://marketcolourpodcast.buzzsprout.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Listen on Buzzsprout <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Books Showcase */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Published Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Deepen your financial literacy with authoritative texts on markets, trading, and personal wealth.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/books">View All Books <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books?.slice(0, 3).map((book, i) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col group overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                  <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                    <img 
                      src={book.coverImage || '/images/book-cover-markets.png'} 
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90 border-none shadow-sm">
                        {book.type === 'both' ? 'Print & Digital' : book.type === 'ebook' ? 'E-Book' : 'Hardcopy'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-6">
                    <h3 className="font-serif text-xl font-bold mb-2 line-clamp-2">{book.title}</h3>
                    <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-6">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-mono font-bold text-primary">
                        {book.hardcopyPrice ? `${book.currency} ${book.hardcopyPrice.toLocaleString()}` : 'Contact for price'}
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/books">Click to Order</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/books">View All Books</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Markets Teaser */}
      <section className="py-24 bg-white border-y border-border/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <img src="/images/markets-abstract.png" alt="Markets Abstract" className="w-full h-full object-cover" />
        </div>
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

      {/* Podcasts Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Latest Podcasts</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tune into recent episodes of The Market Colour for timely analysis and commentary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {podcasts?.map((podcast, i) => (
              <motion.div
                key={podcast.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <a 
                  href={podcast.buzzsproutUrl || "https://marketcolourpodcast.buzzsprout.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group h-full"
                >
                  <Card className="h-full bg-card hover:bg-accent/5 transition-colors border-border/50 hover:border-primary/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground font-mono">
                        <span>{new Date(podcast.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{podcast.duration || '45 min'}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {podcast.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                        {podcast.description}
                      </p>
                      <div className="flex items-center text-primary font-semibold text-sm">
                        Listen Episode <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
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
