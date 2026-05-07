import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListBlogs, getListBlogsQueryKey } from "@workspace/api-client-react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function Blogs() {
  const { data: blogs, isLoading } = useListBlogs({ query: { queryKey: getListBlogsQueryKey() } });

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[50vh] bg-[#0f2337] flex items-end pb-16 pt-36 overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2337]/60 via-[#0f2337]/80 to-[#0f2337]" />
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase mb-4">
              Market Blogs
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Insights & Analysis
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-2xl leading-relaxed">
              Perspectives on Kenya's financial markets, global economics, and investment strategies.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading posts...</div>
          ) : !blogs || blogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog: any, i: number) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all"
                >
                  {blog.coverImage ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-[#0f2337]/5 flex items-center justify-center">
                      <Tag className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-6">
                    {blog.category && (
                      <Badge variant="secondary" className="mb-3 text-xs">{blog.category}</Badge>
                    )}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <Link href={`/blogs/${blog.slug}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          Read More <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
