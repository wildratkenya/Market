import { Link } from "wouter";
import { Mail, Mic, BookOpen, TrendingUp, User } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-secondary-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h2 className="font-serif text-2xl font-bold mb-4 text-white">Jamuhuri Gachoroba</h2>
            <p className="text-secondary-foreground/80 max-w-md leading-relaxed mb-6">
              Kenyan financial expert, author, and host of The Market Colour Podcast. 
              Dedicated to demystifying global money markets and their impact on the Kenyan economy.
            </p>
            <a href="mailto:contact@jamuhuri.com" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors">
              <Mail className="h-4 w-4" />
              contact@jamuhuri.com
            </a>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center gap-2"><BookOpen className="h-4 w-4"/> Home</Link></li>
              <li><Link href="/about" className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center gap-2"><User className="h-4 w-4"/> About</Link></li>
              <li><Link href="/books" className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center gap-2"><BookOpen className="h-4 w-4"/> Books</Link></li>
              <li><Link href="/markets" className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center gap-2"><TrendingUp className="h-4 w-4"/> Markets</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Podcast</h3>
            <p className="text-secondary-foreground/80 mb-4 text-sm">
              Listen to The Market Colour Podcast for weekly insights on global and local markets.
            </p>
            <a 
              href="https://marketcolourpodcast.buzzsprout.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 transition-colors"
            >
              <Mic className="h-4 w-4" />
              Listen Now
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Jamuhuri Gachoroba. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
