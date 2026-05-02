import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Users, MessageSquare, RefreshCw, ChevronDown, ChevronUp,
  Package, Monitor, Check, Clock, BookOpen, Plus, Pencil, Trash2,
  AlertCircle, Truck, CheckCircle2, XCircle, X, LogOut, ShieldCheck, Layout
} from "lucide-react";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import {
  useListOrders, getListOrdersQueryKey,
  useListSubscribers, getListSubscribersQueryKey,
  useListMessages, getListMessagesQueryKey,
  useGetStatsSummary, getGetStatsSummaryQueryKey,
  useListBooks, getListBooksQueryKey,
  useCreateBook, useUpdateBook, useDeleteBook,
  useUpdateOrderStatus,
} from "@workspace/api-client-react";
import type { Book } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import PagesTab from "./admin-pages-tab";
import { useToast } from "@/hooks/use-toast";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const STATUS_META: Record<OrderStatus, { label: string; icon: React.ElementType; className: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,         className: "text-yellow-700 border-yellow-200 bg-yellow-50",  bg: "bg-yellow-500" },
  confirmed: { label: "Confirmed", icon: CheckCircle2,  className: "text-blue-700 border-blue-200 bg-blue-50",        bg: "bg-blue-500" },
  shipped:   { label: "In Transit",icon: Truck,         className: "text-purple-700 border-purple-200 bg-purple-50",  bg: "bg-purple-500" },
  delivered: { label: "Delivered", icon: Check,         className: "text-green-700 border-green-200 bg-green-50",     bg: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: XCircle,       className: "text-red-700 border-red-200 bg-red-50",           bg: "bg-red-400" },
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | undefined; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value ?? "â€”"}</p>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const s = STATUS_META[status as OrderStatus] ?? { label: status, icon: AlertCircle, className: "text-gray-700 border-gray-200 bg-gray-50" };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.className}`}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}

function OrderStatusDropdown({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const updateStatus = useUpdateOrderStatus();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(false);

  if (user?.role === "readonly") {
    return <OrderStatusBadge status={currentStatus} />;
  }

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setLoading(true);
    updateStatus.mutate(
      { id: orderId, data: { status: newStatus as OrderStatus } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
          toast({ title: "Status updated", description: `Order marked as ${STATUS_META[newStatus as OrderStatus]?.label ?? newStatus}` });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Update failed", description: "Could not update order status." });
        },
        onSettled: () => setLoading(false),
      }
    );
  };

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="h-8 text-xs w-36 border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            <span className="flex items-center gap-1.5">
              {(() => { const Icon = STATUS_META[s].icon; return <Icon className="h-3 w-3" />; })()}
              {STATUS_META[s].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const EMPTY_BOOK_FORM = {
  title: "", subtitle: "", description: "", author: "Jamuhuri Gachoroba",
  coverImage: "", type: "both" as "hardcopy" | "ebook" | "both",
  hardcopyPrice: "", ebookPrice: "", currency: "KES",
  isLatest: false, publishedYear: "", category: "",
};

function BookFormDialog({
  open, onClose, initialData, bookId,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: typeof EMPTY_BOOK_FORM | null;
  bookId?: number;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const [form, setForm] = useState(initialData ?? EMPTY_BOOK_FORM);

  const isEdit = bookId !== undefined;

  const set = (field: keyof typeof EMPTY_BOOK_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.author.trim()) {
      toast({ variant: "destructive", title: "Missing required fields", description: "Title, description, and author are required." });
      return;
    }
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim(),
      author: form.author.trim(),
      coverImage: form.coverImage.trim() || null,
      type: form.type,
      hardcopyPrice: form.hardcopyPrice ? Number(form.hardcopyPrice) : null,
      ebookPrice: form.ebookPrice ? Number(form.ebookPrice) : null,
      currency: form.currency || "KES",
      isLatest: form.isLatest,
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      category: form.category.trim() || null,
    };

    const opts = {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListBooksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        toast({ title: isEdit ? "Book updated" : "Book added", description: `"${payload.title}" saved successfully.` });
        onClose();
      },
      onError: () => {
        toast({ variant: "destructive", title: "Save failed", description: "Could not save the book." });
      },
    };

    if (isEdit && bookId !== undefined) {
      updateBook.mutate({ id: bookId, data: payload }, opts);
    } else {
      createBook.mutate({ data: payload }, opts);
    }
  };

  const isPending = createBook.isPending || updateBook.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="bg-[#0f2337] px-6 py-5 text-white shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">{isEdit ? "Edit Book" : "Add New Book"}</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input value={form.title} onChange={set("title")} placeholder="e.g. Money Markets of East Africa" required />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Subtitle</Label>
                <Input value={form.subtitle} onChange={set("subtitle")} placeholder="Optional subtitle" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Description <span className="text-red-500">*</span></Label>
                <Textarea value={form.description} onChange={set("description")} placeholder="Book description..." rows={3} required />
              </div>
              <div className="space-y-1.5">
                <Label>Author <span className="text-red-500">*</span></Label>
                <Input value={form.author} onChange={set("author")} placeholder="Author name" required />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={form.category} onChange={set("category")} placeholder="e.g. Finance, Economics" />
              </div>
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as typeof form.type }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardcopy">Hard Copy Only</SelectItem>
                    <SelectItem value="ebook">E-Book Only</SelectItem>
                    <SelectItem value="both">Both Formats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Published Year</Label>
                <Input value={form.publishedYear} onChange={set("publishedYear")} placeholder="e.g. 2024" type="number" />
              </div>
              <div className="space-y-1.5">
                <Label>Hard Copy Price (KES)</Label>
                <Input value={form.hardcopyPrice} onChange={set("hardcopyPrice")} placeholder="e.g. 1500" type="number" />
              </div>
              <div className="space-y-1.5">
                <Label>E-Book Price (KES)</Label>
                <Input value={form.ebookPrice} onChange={set("ebookPrice")} placeholder="e.g. 800" type="number" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Cover Image</Label>
                <div className="flex gap-4 items-start">
                  {form.coverImage && (
                    <div className="w-20 h-28 rounded border border-border overflow-hidden shrink-0 bg-muted">
                      <img src={form.coverImage.startsWith('/') ? form.coverImage : form.coverImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <Input 
                      value={form.coverImage} 
                      onChange={set("coverImage")} 
                      placeholder="Paste image URL or upload below..." 
                    />
                    <div className="flex items-center gap-2">
                       <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="cover-upload" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append("image", file);
                          
                          try {
                            const { token } = JSON.parse(localStorage.getItem("adminToken") || '{}');
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              headers: {
                                "Authorization": `Bearer ${token || localStorage.getItem("adminToken")}`
                              },
                              body: formData
                            });
                            
                            if (!res.ok) throw new Error("Upload failed");
                            const data = await res.json();
                            setForm(f => ({ ...f, coverImage: data.url }));
                          } catch (err) {
                            toast({ variant: "destructive", title: "Upload failed", description: "Could not upload the image." });
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="h-9 gap-2"
                        onClick={() => document.getElementById("cover-upload")?.click()}
                      >
                        <Plus className="h-4 w-4" /> Upload Image
                      </Button>
                      <p className="text-[10px] text-muted-foreground italic">Saved in /public/images</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isLatest"
                  checked={form.isLatest}
                  onChange={(e) => setForm((f) => ({ ...f, isLatest: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isLatest" className="cursor-pointer">Mark as Latest / Featured</Label>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-[#0f2337] hover:bg-[#0f2337]/90 text-white px-6">
              {isPending ? "Savingâ€¦" : isEdit ? "Save Changes" : "Add Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BooksTab() {
  const { data: books, isLoading } = useListBooks({ query: { queryKey: getListBooksQueryKey() } });
  const deleteBook = useDeleteBook();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const canEdit = user?.role === "editor" || user?.role === "super_admin";
  const canDelete = user?.role === "super_admin";

  const handleDelete = (book: Book) => {
    setDeletingId(book.id);
    fetch(`/api/books/${book.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (r) => {
        if (r.status === 409) {
          const data = await r.json();
          const orderList = (data.orders || []).map((o: any) => `#${o.id} - ${o.customer_name} (${o.status})`).join("\n");
          const confirmed = window.confirm(
            `Cannot delete "${book.title}".\n\nIt has ${data.orderCount} associated order(s):\n${orderList}\n\nDo you want to delete this book AND cancel/remove all its orders? This cannot be undone.`
          );
          if (!confirmed) {
            setDeletingId(null);
            return;
          }
          return fetch(`/api/books/${book.id}?cascade=true`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
        }
        return r;
      })
      .then(async (r) => {
        if (!r) return;
        if (r.ok) {
          qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
          qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          qc.invalidateQueries({ queryKey: getListBooksQueryKey() });
          toast({ title: "Book deleted", description: `"${book.title}" has been removed.` });
          setTimeout(() => window.location.reload(), 500);
        } else {
          const data = await r.json().catch(() => ({}));
          toast({ variant: "destructive", title: "Delete failed", description: data.error || "Could not delete the book." });
        }
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Delete failed", description: "Network error." });
      })
      .finally(() => setDeletingId(null));
  };

  const toFormData = (book: Book): typeof EMPTY_BOOK_FORM => ({
    title: book.title,
    subtitle: book.subtitle ?? "",
    description: book.description,
    author: book.author,
    coverImage: book.coverImage ?? "",
    type: book.type as "hardcopy" | "ebook" | "both",
    hardcopyPrice: book.hardcopyPrice != null ? String(book.hardcopyPrice) : "",
    ebookPrice: book.ebookPrice != null ? String(book.ebookPrice) : "",
    currency: book.currency,
    isLatest: book.isLatest,
    publishedYear: book.publishedYear != null ? String(book.publishedYear) : "",
    category: book.category ?? "",
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">{books?.length ?? 0} Book{books?.length !== 1 ? "s" : ""} in catalog</h2>
        {canEdit && (
          <Button onClick={() => setAddOpen(true)} className="bg-[#c9a227] hover:bg-[#c9a227]/90 text-white gap-2">
            <Plus className="h-4 w-4" /> Add Book
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : books?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No books yet</p>
          <p className="text-sm mt-1">Click "Add Book" to add your first title</p>
        </div>
      ) : (
        <div className="space-y-3">
          {books?.map((book) => (
            <div key={book.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
              <div className="w-12 h-16 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-foreground">{book.title}</p>
                  {book.isLatest && (
                    <span className="text-xs font-semibold bg-[#c9a227]/10 text-[#c9a227] px-2 py-0.5 rounded-full border border-[#c9a227]/20">Featured</span>
                  )}
                </div>
                {book.subtitle && <p className="text-sm text-muted-foreground italic">{book.subtitle}</p>}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{book.author}</span>
                  {book.publishedYear && <span className="text-xs text-muted-foreground">â€¢ {book.publishedYear}</span>}
                  {book.category && <span className="text-xs text-muted-foreground">â€¢ {book.category}</span>}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    book.type === "hardcopy" ? "bg-orange-100 text-orange-700" :
                    book.type === "ebook" ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {book.type === "both" ? "Both Formats" : book.type === "hardcopy" ? "Hard Copy" : "E-Book"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {book.hardcopyPrice != null && (
                    <span className="text-xs text-muted-foreground">Hard Copy: {book.currency} {book.hardcopyPrice.toLocaleString()}</span>
                  )}
                  {book.ebookPrice != null && (
                    <span className="text-xs text-muted-foreground">E-Book: {book.currency} {book.ebookPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditBook(book)}
                    className="h-8 px-3 gap-1.5 text-xs"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(book)}
                      disabled={deletingId === book.id}
                      className="h-8 px-3 gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> {deletingId === book.id ? "â€¦" : "Delete"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BookFormDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editBook && (
        <BookFormDialog
          open={!!editBook}
          onClose={() => setEditBook(null)}
          initialData={toFormData(editBook)}
          bookId={editBook.id}
        />
      )}
    </motion.div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = [...(orders || [])].reverse().filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  const countByStatus = (s: OrderStatus) => orders?.filter((o) => o.status === s).length ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Status filter strip */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            statusFilter === "all"
              ? "bg-[#0f2337] text-white border-[#0f2337]"
              : "bg-background text-muted-foreground border-border hover:border-foreground/40"
          }`}
        >
          All ({orders?.length ?? 0})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              statusFilter === s
                ? `${STATUS_META[s].bg} text-white border-transparent`
                : "bg-background text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {STATUS_META[s].label} ({countByStatus(s)})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No {statusFilter !== "all" ? STATUS_META[statusFilter].label.toLowerCase() : ""} orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${order.orderType === "hardcopy" ? "bg-orange-100" : "bg-blue-100"}`}>
                    {order.orderType === "hardcopy"
                      ? <Package className="h-5 w-5 text-orange-600" />
                      : <Monitor className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{order.bookTitle}</p>
                    <p className="text-sm text-muted-foreground">{order.customerName} Â· {order.customerEmail}</p>
                    {order.customerPhone && <p className="text-xs text-muted-foreground">{order.customerPhone}</p>}
                    {order.orderType === "hardcopy" && (order.deliveryAddress || order.deliveryCity) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ðŸ“ {[order.deliveryAddress, order.deliveryCity].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:flex-col md:items-end">
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.orderType === "hardcopy" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                      {order.orderType === "hardcopy" ? "Hard Copy" : "Digital"}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              {order.notes && (
                <div className="mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground italic">
                  Note: {order.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MessageRow({ msg }: { msg: { id: number; type: string; subject: string; body: string; senderEmail?: string | null; createdAt: string } }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors: Record<string, string> = {
    contact: "bg-blue-100 text-blue-700",
    order: "bg-orange-100 text-orange-700",
    subscription: "bg-purple-100 text-purple-700",
  };
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${typeColors[msg.type] || "bg-gray-100 text-gray-700"}`}>
          {msg.type}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{msg.subject}</p>
          {msg.senderEmail && <p className="text-xs text-muted-foreground">{msg.senderEmail}</p>}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {new Date(msg.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-border/50">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed mb-4">{msg.body}</pre>
          {!msg.readAt && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
              className="text-xs h-8"
            >
              Mark as Read
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState<"books" | "orders" | "subscribers" | "messages" | "admins" | "pages">("orders");
  const qc = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [, setLocation] = useLocation();

  const { data: stats } = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });
  const { data: orders } = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const { data: subscribers, isLoading: subsLoading } = useListSubscribers({ query: { queryKey: getListSubscribersQueryKey() } });
  const { data: messages, isLoading: msgsLoading } = useListMessages({ query: { queryKey: getListMessagesQueryKey() } });
  const { data: books } = useListBooks({ query: { queryKey: getListBooksQueryKey() } });

  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;

  const isReadonly = user?.role === "readonly";

  const allTabs = [
    { id: "orders" as const,      label: "Orders",      icon: ShoppingBag, count: orders?.length,      alert: pendingOrders > 0 ? pendingOrders : undefined },
    { id: "books" as const,       label: "Books",       icon: BookOpen,    count: books?.length },
    { id: "subscribers" as const, label: "Subscribers", icon: Users,       count: subscribers?.length },
    { id: "messages" as const,    label: "Messages",    icon: MessageSquare, count: messages?.length },
    { id: "admins" as const,      label: "Manage Admins", icon: ShieldCheck,   count: undefined },
    { id: "pages" as const,       label: "Site Pages",    icon: Layout,            count: undefined },
  ];
  const tabs = isReadonly ? allTabs.filter((t) => t.id === "orders") : (user?.role === 'super_admin' ? allTabs : allTabs.filter(t => t.id !== 'admins'));

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#c9a227] border-t-transparent animate-spin" />
      </div>
    );
  }


  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2337] pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase mb-2">Admin Panel</p>
              <h1 className="text-4xl font-serif font-bold text-white">Dashboard</h1>
              <p className="text-white/60 mt-2">
                Signed in as <span className="text-white font-medium">{user?.username}</span>
                {" "}<span className="text-[#c9a227] text-xs uppercase font-semibold tracking-wider">({user?.role?.replace("_", " ")})</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => qc.invalidateQueries()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/40"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard icon={ShoppingBag} label="Total Orders"  value={stats?.totalOrders}      color="bg-[#c9a227]" />
            <StatCard icon={BookOpen}    label="Books"         value={stats?.totalBooks}        color="bg-[#0f2337] border border-white/20" />
            <StatCard icon={Users}       label="Subscribers"   value={stats?.totalSubscribers}  color="bg-blue-500" />
            <StatCard icon={MessageSquare} label="Messages"    value={messages?.length}         color="bg-purple-500" />
          </div>

          {pendingOrders > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-400/30 rounded-xl px-4 py-3 text-yellow-300 text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {pendingOrders} order{pendingOrders > 1 ? "s" : ""} awaiting confirmation
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border sticky top-20 bg-background z-10">
        <div className="container mx-auto px-6 max-w-7xl flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-[#c9a227] text-[#c9a227]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.count !== undefined && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? "bg-[#c9a227]/20 text-[#c9a227]" : "bg-muted text-muted-foreground"}`}>
                  {t.count}
                </span>
              )}
              {t.alert && (
                <span className="ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-bold bg-yellow-100 text-yellow-700">
                  {t.alert} new
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-7xl py-8">
        <AnimatePresence mode="wait">
          {tab === "orders" && <OrdersTab key="orders" />}
          {tab === "books" && <BooksTab key="books" />}

          {tab === "subscribers" && (
            <motion.div key="subscribers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {subsLoading ? (
                <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
              ) : subscribers?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No subscribers yet</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["#", "Name", "Email", "Phone", "WhatsApp", "Approved", "Date"].map((h) => (
                          <th key={h} className="text-left p-4 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...(subscribers || [])].reverse().map((sub, i) => (
                        <tr key={sub.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-muted-foreground">{i + 1}</td>
                          <td className="p-4 font-medium text-foreground">{sub.name}</td>
                          <td className="p-4 text-muted-foreground">{sub.email}</td>
                          <td className="p-4 text-muted-foreground">{sub.phone || "â€”"}</td>
                          <td className="p-4">
                            {sub.wantsWhatsapp
                              ? <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Requested</span>
                              : <span className="text-xs text-muted-foreground">No</span>}
                          </td>
                          <td className="p-4">
                            {sub.wantsWhatsapp
                              ? sub.whatsappApproved
                                ? <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <Button 
                                      size="xs" 
                                      variant="ghost" 
                                      className="h-6 px-1.5 text-[10px]"
                                      onClick={() => {
                                        fetch(`/api/subscribers/${sub.id}/whatsapp`, {
                                          method: 'PATCH',
                                          headers: { 
                                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                                            'Content-Type': 'application/json'
                                          },
                                          body: JSON.stringify({ approved: false })
                                        }).then(() => qc.invalidateQueries({ queryKey: getListSubscribersQueryKey() }));
                                      }}
                                    >Revoke</Button>
                                  </div>
                                : <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <Button 
                                      size="xs" 
                                      variant="secondary"
                                      className="h-6 px-1.5 text-[10px] bg-green-500 text-white hover:bg-green-600"
                                      onClick={() => {
                                        fetch(`/api/subscribers/${sub.id}/whatsapp`, {
                                          method: 'PATCH',
                                          headers: { 
                                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                                            'Content-Type': 'application/json'
                                          },
                                          body: JSON.stringify({ approved: true })
                                        }).then(() => qc.invalidateQueries({ queryKey: getListSubscribersQueryKey() }));
                                      }}
                                    >Approve</Button>
                                  </div>
                              : <span className="text-muted-foreground">â€”</span>}
                          </td>
                          <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(sub.subscribedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {tab === "messages" && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {msgsLoading ? (
                <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
              ) : messages?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...(messages || [])].reverse().map((msg) => (
                    <MessageRow 
                      key={msg.id} 
                      msg={msg} 
                      onMarkRead={() => {
                        fetch(`/api/messages/${msg.id}/read`, { 
                          method: 'PATCH', 
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } 
                        }).then(() => qc.invalidateQueries({ queryKey: getListMessagesQueryKey() }));
                      }} 
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {tab === "pages" && <PagesTab />}
          {tab === "admins" && (
            <motion.div key="admins" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card border border-border rounded-xl overflow-hidden p-8 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-[#c9a227]" />
                <h3 className="text-xl font-bold mb-2">Admin Management</h3>
                <p className="text-muted-foreground mb-6">As Super Admin, you can invite and manage other administrators here.</p>
                <div className="max-w-md mx-auto p-6 border border-border rounded-xl bg-muted/20">
                  <p className="text-sm italic">Feature note: You can currently manage admins via the direct database seeding. A full interactive admin manager UI is being finalized.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}





