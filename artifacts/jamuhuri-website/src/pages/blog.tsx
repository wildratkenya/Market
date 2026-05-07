import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetBlog } from "@workspace/api-client-react";
import NotFound from "./not-found";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function Blog() {
  const { slug } = useParams();
  const { data: blog, isLoading, error } = useGetBlog({ query: { queryKey: ["/api/blogs", slug] } });

  if (!isLoading && (error || !blog)) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      {blog.coverImage ? (
        <section className="relative h-[50vh] overflow-hidden">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </section>
      ) : (
        <section className="h-32 bg-[#0f2337]" />
      )}

      {/* Content */}
      <section className="-mt-20 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                {blog.category && (
                  <Badge className="bg-[#c9a227] text-[#0f2337]">{blog.category}</Badge>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-8 leading-tight">
                {blog.title}
              </motion.h1>

              <motion.div variants={fadeUp} className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                {blog.content.split("\n\n").map((paragraph: string, i: number) => (
                  <p key={i} className="mb-6 last:mb-0 whitespace-pre-line">{paragraph}</p>
                ))}
              </motion.div>

              <div className="mt-12 pt-6 border-t border-border">
                <Link href="/blogs">
                  <Button variant="outline" className="hover:bg-[#c9a227]/10 hover:border-[#c9a227]/30">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Posts
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
