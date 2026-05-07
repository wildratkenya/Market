import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { useListBlogs, getListBlogsQueryKey } from "@workspace/api-client-react";

export default function BlogsTab() {
  const { data: blogs, isLoading } = useListBlogs({ query: { queryKey: getListBlogsQueryKey() } });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverImage: "", category: "", published: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAdminAuth();

  const canDelete = user?.role === "super_admin";
  const token = localStorage.getItem("adminToken") || "";
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", category: "", published: true });
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setOpen(true); };

  const openEdit = (blog: any) => {
    setEditing(blog);
    setForm({
      title: blog.title, slug: blog.slug, excerpt: blog.excerpt,
      content: blog.content, coverImage: blog.coverImage || "",
      category: blog.category || "", published: blog.published,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      toast({ variant: "destructive", title: "Missing fields", description: "Title, slug, excerpt, and content are required." });
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/blogs/${editing.id}` : "/api/blogs";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(form) });
      if (res.ok) {
        toast({ title: editing ? "Post updated" : "Post created" });
        qc.invalidateQueries({ queryKey: getListBlogsQueryKey() });
        setOpen(false);
        resetForm();
      } else {
        const err = await res.json();
        toast({ variant: "destructive", title: "Save failed", description: err.error || "Unknown error" });
      }
    } catch {
      toast({ variant: "destructive", title: "Save failed", description: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        toast({ title: "Post deleted" });
        qc.invalidateQueries({ queryKey: getListBlogsQueryKey() });
      } else {
        toast({ variant: "destructive", title: "Delete failed" });
      }
    } catch {
      toast({ variant: "destructive", title: "Delete failed", description: "Network error" });
    } finally {
      setDeleting(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, coverImage: data.url || data.path });
        toast({ title: "Image uploaded" });
      } else {
        toast({ variant: "destructive", title: "Upload failed" });
      }
    } catch {
      toast({ variant: "destructive", title: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Blog Posts</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e]">
              <Plus className="h-4 w-4 mr-1" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Post" : "New Blog Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
                </div>
                <div className="space-y-1">
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-slug" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Excerpt *</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short description" rows={2} />
              </div>
              <div className="space-y-1">
                <Label>Content *</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full article content" rows={8} />
              </div>
              <div className="space-y-1">
                <Label>Cover Image</Label>
                <div className="flex gap-2">
                  <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="Image URL or upload" className="flex-1" />
                  <label className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Market Analysis" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm">Published</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e]">
                  {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Save Post"}
                </Button>
                <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
      ) : !blogs || blogs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No blog posts yet. Create your first post!</div>
      ) : (
        <div className="space-y-2">
          {blogs.map((blog: any) => (
            <div key={blog.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{blog.title}</span>
                  {blog.published ? (
                    <Badge className="bg-green-100 text-green-700"><Eye className="h-3 w-3 mr-1" />Published</Badge>
                  ) : (
                    <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>
                  )}
                  {blog.category && <Badge variant="outline">{blog.category}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{blog.slug} &middot; {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(blog)}><Pencil className="h-4 w-4" /></Button>
                {canDelete && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(blog.id)} disabled={deleting === blog.id}>
                    {deleting === blog.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
