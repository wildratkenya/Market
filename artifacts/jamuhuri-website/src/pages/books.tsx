import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Filter, Search, Package, Monitor, Minus, Plus } from "lucide-react";
import bookCoverImg from "@assets/An_Introduction_to_Financial_Markets_1775134561365.png";
import { useListBooks, getListBooksQueryKey, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@workspace/api-client-react";

const orderSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  orderType: z.enum(["hardcopy", "ebook"]),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  quantity: z.number().min(1, "Minimum 1 copy"),
}).superRefine((data, ctx) => {
  if (data.orderType === "hardcopy") {
    if (!data.customerPhone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone required for delivery", path: ["customerPhone"] });
    }
    if (!data.deliveryAddress) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Address required for delivery", path: ["deliveryAddress"] });
    }
  }
});

export default function Books() {
  const { data: books, isLoading } = useListBooks({ query: { queryKey: getListBooksQueryKey() } });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [showFullDesc, setShowFullDesc] = useState<Record<number, boolean>>({});
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      orderType: "hardcopy",
      customerPhone: "",
      deliveryAddress: "",
      deliveryCity: "",
      quantity: 1,
    },
  });

  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrderClick = (book: Book, type: "hardcopy" | "ebook") => {
    setSelectedBook(book);
    form.reset({
      customerName: "",
      customerEmail: "",
      orderType: type,
      customerPhone: "",
      deliveryAddress: "",
      deliveryCity: "",
      quantity: 1,
    });
    setIsOrderModalOpen(true);
  };

  const watchOrderType = form.watch("orderType");
  const watchQuantity = form.watch("quantity") || 1;

  const unitPrice = selectedBook 
    ? (watchOrderType === "hardcopy" ? Number(selectedBook.hardcopyPrice || 0) : Number(selectedBook.ebookPrice || 0))
    : 0;
  
  const totalPrice = unitPrice * watchQuantity;
  const vatAmount = totalPrice * (16 / 116);
  const subtotal = totalPrice - vatAmount;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const onSubmit = (values: z.infer<typeof orderSchema>) => {
    if (!selectedBook) return;

    createOrder.mutate(
      {
        data: {
          bookId: selectedBook.id,
          bookTitle: selectedBook.title,
          orderType: values.orderType,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          customerPhone: values.customerPhone,
          deliveryAddress: values.deliveryAddress,
          deliveryCity: values.deliveryCity,
          quantity: values.quantity,
          totalAmount: totalPrice.toFixed(2),
          vatAmount: vatAmount.toFixed(2),
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Order Placed Successfully",
            description: "We will contact you shortly regarding your order.",
          });
          setIsOrderModalOpen(false);
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Order Failed",
            description: "There was a problem placing your order. Please try again.",
          });
        }
      }
    );
  };

  return (
    <div className="w-full pb-24">
      {/* Header */}
      <section className="bg-secondary text-white pt-16 pb-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Publications & Books</h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Explore the complete collection of Jamuhuri Gachoroba's works. Authoritative insights into money markets, economic trends, and personal finance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Catalog */}
      <section className="container mx-auto px-4 -mt-16">
        <div className="bg-background rounded-2xl shadow-xl border border-border/50 p-6 md:p-8 mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search books by title or topic..." 
                className="pl-10 h-12 text-base"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); scrollToTop(); }}
              />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground w-full md:w-auto justify-end">
              <Filter className="h-5 w-5" />
              <span className="font-medium">{filteredBooks?.length || 0} Books found</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[500px] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks?.map((book, i) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/5] relative bg-muted overflow-hidden flex items-center justify-center p-8">
                    <img 
                      src={book.coverImage || bookCoverImg} 
                      alt={book.title}
                      className="object-contain w-full h-full drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex gap-1 flex-col">
                      {(book.type === 'hardcopy' || book.type === 'both') && (
                        <Badge className="bg-orange-100 text-orange-800 border-none shadow-sm font-semibold text-xs">
                          Hard Copy
                        </Badge>
                      )}
                      {(book.type === 'ebook' || book.type === 'both') && (
                        <Badge className="bg-blue-100 text-blue-800 border-none shadow-sm font-semibold text-xs">
                          Digital
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-8 bg-background z-10 relative">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wider text-primary uppercase">{book.category || 'Finance'}</span>
                      <span className="text-xs text-muted-foreground">• {book.publishedYear || 'Recent'}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-3">{book.title}</h3>
                    {book.subtitle && <h4 className="text-muted-foreground font-medium mb-3 italic">{book.subtitle}</h4>}
                    <p className="text-muted-foreground text-sm flex-1 mb-4 leading-relaxed">
                      {book.description && book.description.length > 180
                        ? (showFullDesc[book.id] ? book.description : book.description.slice(0, 180) + '...')
                        : book.description}
                    </p>
                    {book.description && book.description.length > 180 && !showFullDesc[book.id] && (
                      <button
                        onClick={() => setPreviewBook(book)}
                        className="text-xs text-primary font-semibold mb-6 hover:underline"
                      >
                        More Details
                      </button>
                    )}
                    {book.description && book.description.length > 180 && showFullDesc[book.id] && (
                      <button
                        onClick={() => setShowFullDesc(prev => ({ ...prev, [book.id]: false }))}
                        className="text-xs text-primary font-semibold mb-6 hover:underline"
                      >
                        Show Less
                      </button>
                    )}
                    
                    <div className="border-t border-border/50 pt-6 mt-auto">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Price from</span>
                          <span className="font-mono text-xl font-bold text-foreground">
                            {book.hardcopyPrice
                              ? `${book.currency} ${book.hardcopyPrice.toLocaleString()}`
                              : book.ebookPrice
                              ? `${book.currency} ${book.ebookPrice.toLocaleString()}`
                              : 'Contact for price'}
                          </span>
                        </div>
                        <Button
                          onClick={() => setPreviewBook(book)}
                          variant="outline"
                          className="w-full text-sm py-5 border-primary/30 text-primary hover:bg-primary/5 font-semibold gap-2"
                        >
                          <BookOpen className="h-4 w-4" /> More Details & Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Book Preview Dialog */}
      <Dialog open={!!previewBook} onOpenChange={(open) => !open && setPreviewBook(null)}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          {previewBook && (
            <>
              <div className="bg-secondary p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif">{previewBook.title}</DialogTitle>
                  <DialogDescription className="text-white/70">
                    {previewBook.subtitle}
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{previewBook.category || 'Finance'}</Badge>
                  {previewBook.type === 'hardcopy' && <Badge className="bg-orange-100 text-orange-800 border-none">Hard Copy</Badge>}
                  {previewBook.type === 'ebook' && <Badge className="bg-blue-100 text-blue-800 border-none">Digital</Badge>}
                  {previewBook.type === 'both' && (<>
                    <Badge className="bg-orange-100 text-orange-800 border-none">Hard Copy</Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-none">Digital</Badge>
                  </>)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">About this Book</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{previewBook.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  {previewBook.hardcopyPrice && (
                    <div className="text-center p-4 bg-background rounded-lg border">
                      <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground mb-1">Hard Copy</p>
                      <p className="font-mono text-lg font-bold">{previewBook.currency} {previewBook.hardcopyPrice.toLocaleString()}</p>
                    </div>
                  )}
                  {previewBook.ebookPrice && (
                    <div className="text-center p-4 bg-background rounded-lg border">
                      <Monitor className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-xs text-muted-foreground mb-1">Digital Copy</p>
                      <p className="font-mono text-lg font-bold">{previewBook.currency} {previewBook.ebookPrice.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium">
                    <strong className="text-primary">Payment:</strong> Till No: <strong>3016590</strong>. For all communication email: intro2fin.markets@gmail.com
                  </p>
                </div>
              </div>
              <div className="p-6 border-t space-y-3 bg-background">
                {(previewBook.type === 'hardcopy' || previewBook.type === 'both') && (
                  <Button
                    onClick={() => { handleOrderClick(previewBook, "hardcopy"); setPreviewBook(null); }}
                    className="w-full py-6 bg-[#0f2337] hover:bg-[#0f2337]/90 text-white font-semibold gap-2"
                  >
                    <Package className="h-5 w-5" /> Order Hard Copy
                  </Button>
                )}
                {(previewBook.type === 'ebook' || previewBook.type === 'both') && (
                  <Button
                    onClick={() => { handleOrderClick(previewBook, "ebook"); setPreviewBook(null); }}
                    variant="outline"
                    className="w-full py-6 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold gap-2"
                  >
                    <Monitor className="h-5 w-5" /> Order Digital Copy
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-secondary p-6 text-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Order Details</DialogTitle>
              <DialogDescription className="text-white/70">
                You are ordering: <span className="font-bold text-primary">{selectedBook?.title}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-4 flex items-center gap-3">
                  {watchOrderType === "hardcopy"
                    ? <Package className="h-5 w-5 text-[#0f2337]" />
                    : <Monitor className="h-5 w-5 text-blue-600" />
                  }
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Format</p>
                    <p className="font-bold text-foreground">
                      {watchOrderType === "hardcopy" ? "Hard Copy (Physical Delivery)" : "Digital Copy (Sent by Email)"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end border-y border-border/50 py-6">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 shrink-0"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              className="text-center h-10 text-lg font-bold" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 shrink-0"
                              onClick={() => field.onChange(field.value + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Subtotal (Excl. VAT)</span>
                      <span>{selectedBook?.currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>VAT (16% Inclusive)</span>
                      <span>{selectedBook?.currency} {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-foreground pt-2 border-t border-border/30">
                      <span>Total Amount</span>
                      <span className="text-[#c9a227]">{selectedBook?.currency} {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {watchOrderType === 'hardcopy' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-border/50"
                  >
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
                      <p className="text-sm font-medium text-foreground">
                        <strong className="text-primary">Payment:</strong> Till No: <strong>3016590</strong>. Amount: KES 3,000 (Hardcopy). Shipping charges apply based on your location and courier rates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input placeholder="+254..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City / Town</FormLabel>
                            <FormControl><Input placeholder="Nairobi" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl><Input placeholder="Street, Building, Office..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {watchOrderType === 'ebook' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-primary/10 p-4 rounded-lg border border-primary/20 mt-4"
                  >
                    <p className="text-sm font-medium text-foreground">
                      <strong className="text-primary">E-Book Payment:</strong> Till No: <strong>3016590</strong>. Amount: KES 2,000 (Softcopy). Payment confirmation and your email address required for instant delivery.
                    </p>
                  </motion.div>
                )}

                <div className="pt-6 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createOrder.isPending} className="px-8">
                    {createOrder.isPending ? "Processing..." : "Confirm Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


