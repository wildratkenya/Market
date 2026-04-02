import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Filter, Search } from "lucide-react";
import { useListBooks, getListBooksQueryKey, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    },
  });

  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrderClick = (book: Book) => {
    setSelectedBook(book);
    form.reset({
      ...form.getValues(),
      orderType: book.type === "ebook" ? "ebook" : "hardcopy",
    });
    setIsOrderModalOpen(true);
  };

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

  const watchOrderType = form.watch("orderType");

  return (
    <div className="w-full pb-24">
      {/* Header */}
      <section className="bg-secondary text-white pt-24 pb-32">
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      src={book.coverImage || '/images/book-cover-markets.png'} 
                      alt={book.title}
                      className="object-contain w-full h-full drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm font-semibold">
                        {book.type === 'both' ? 'Print & Digital' : book.type === 'ebook' ? 'E-Book' : 'Hardcopy'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-8 bg-background z-10 relative">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wider text-primary uppercase">{book.category || 'Finance'}</span>
                      <span className="text-xs text-muted-foreground">• {book.publishedYear || 'Recent'}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-3">{book.title}</h3>
                    {book.subtitle && <h4 className="text-muted-foreground font-medium mb-3 italic">{book.subtitle}</h4>}
                    <p className="text-muted-foreground text-sm flex-1 mb-6 leading-relaxed">
                      {book.description}
                    </p>
                    
                    <div className="border-t border-border/50 pt-6 mt-auto">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Price from</span>
                          <span className="font-mono text-xl font-bold text-foreground">
                            {book.hardcopyPrice ? `${book.currency} ${book.hardcopyPrice.toLocaleString()}` : 'Varies'}
                          </span>
                        </div>
                        <Button 
                          onClick={() => handleOrderClick(book)}
                          className="w-full text-base py-6"
                        >
                          Order Book
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

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <div className="bg-secondary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Order Details</DialogTitle>
              <DialogDescription className="text-white/70">
                You are ordering: <span className="font-bold text-primary">{selectedBook?.title}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6">
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

                <FormField
                  control={form.control}
                  name="orderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(selectedBook?.type === 'hardcopy' || selectedBook?.type === 'both') && (
                            <SelectItem value="hardcopy">Physical Hardcopy</SelectItem>
                          )}
                          {(selectedBook?.type === 'ebook' || selectedBook?.type === 'both') && (
                            <SelectItem value="ebook">Digital E-Book</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchOrderType === 'hardcopy' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-border/50"
                  >
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
                      <p className="text-sm font-medium text-foreground">
                        <strong className="text-primary">Note:</strong> Payment is collected on delivery via M-PESA. Shipping charges apply based on your location and courier rates.
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
                      <strong className="text-primary">E-Book Delivery:</strong> Payment instructions will be sent to your email. Upon payment confirmation, the digital copy will be delivered instantly to your inbox.
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
