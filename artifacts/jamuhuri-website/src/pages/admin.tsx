import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Users, MessageSquare, RefreshCw, ChevronDown, ChevronUp, Package, Monitor, Check, X, Clock } from "lucide-react";
import { useListOrders, getListOrdersQueryKey, useListSubscribers, getListSubscribersQueryKey, useListMessages, getListMessagesQueryKey, useGetStatsSummary, getGetStatsSummaryQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | undefined; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
    shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 border-purple-200" },
    delivered: { label: "Delivered", className: "bg-green-100 text-green-800 border-green-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const s = map[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  return <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${s.className}`}>{s.label}</span>;
}

export default function Admin() {
  const [tab, setTab] = useState<"orders" | "subscribers" | "messages">("orders");
  const qc = useQueryClient();

  const { data: stats } = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });
  const { data: orders, isLoading: ordersLoading } = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const { data: subscribers, isLoading: subsLoading } = useListSubscribers({ query: { queryKey: getListSubscribersQueryKey() } });
  const { data: messages, isLoading: msgsLoading } = useListMessages({ query: { queryKey: getListMessagesQueryKey() } });

  const handleRefresh = () => {
    qc.invalidateQueries();
  };

  const tabs = [
    { id: "orders" as const, label: "Book Orders", icon: ShoppingBag, count: orders?.length },
    { id: "subscribers" as const, label: "Subscribers", icon: Users, count: subscribers?.length },
    { id: "messages" as const, label: "Messages & Feedback", icon: MessageSquare, count: messages?.length },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2337] pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase mb-2">Admin Panel</p>
              <h1 className="text-4xl font-serif font-bold text-white">Dashboard</h1>
              <p className="text-white/60 mt-2">Monitor orders, subscribers, and feedback</p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders} color="bg-[#c9a227]" />
            <StatCard icon={Users} label="Subscribers" value={stats?.totalSubscribers} color="bg-blue-500" />
            <StatCard icon={MessageSquare} label="Messages" value={messages?.length} color="bg-purple-500" />
            <StatCard icon={Package} label="Books" value={stats?.totalBooks} color="bg-green-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border sticky top-20 bg-background z-10">
        <div className="container mx-auto px-6 max-w-7xl flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
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
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-7xl py-8">

        {/* Orders Tab */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {ordersLoading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : orders?.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...(orders || [])].reverse().map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${order.orderType === "hardcopy" ? "bg-orange-100" : "bg-blue-100"}`}>
                          {order.orderType === "hardcopy"
                            ? <Package className="h-5 w-5 text-orange-600" />
                            : <Monitor className="h-5 w-5 text-blue-600" />
                          }
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{order.bookTitle}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName} · {order.customerEmail}</p>
                          {order.customerPhone && <p className="text-xs text-muted-foreground">{order.customerPhone}</p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:shrink-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.orderType === "hardcopy" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                          {order.orderType === "hardcopy" ? "Hard Copy" : "Digital"}
                        </span>
                        <OrderStatusBadge status={order.status} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    {order.orderType === "hardcopy" && (order.deliveryAddress || order.deliveryCity) && (
                      <div className="mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground">
                        Delivery: {[order.deliveryAddress, order.deliveryCity].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Subscribers Tab */}
        {tab === "subscribers" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {subsLoading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : subscribers?.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No subscribers yet</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-muted-foreground">#</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Phone</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">WhatsApp</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Approved</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(subscribers || [])].reverse().map((sub, i) => (
                      <tr key={sub.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-muted-foreground">{i + 1}</td>
                        <td className="p-4 font-medium text-foreground">{sub.name}</td>
                        <td className="p-4 text-muted-foreground">{sub.email}</td>
                        <td className="p-4 text-muted-foreground">{sub.phone || "—"}</td>
                        <td className="p-4">
                          {sub.wantsWhatsapp
                            ? <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Requested</span>
                            : <span className="text-xs text-muted-foreground">No</span>
                          }
                        </td>
                        <td className="p-4">
                          {sub.wantsWhatsapp && (
                            sub.whatsappApproved
                              ? <Check className="h-4 w-4 text-green-500" />
                              : <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          {!sub.wantsWhatsapp && <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
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

        {/* Messages Tab */}
        {tab === "messages" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {msgsLoading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : messages?.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...(messages || [])].reverse().map((msg) => (
                  <MessageRow key={msg.id} msg={msg} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MessageRow({ msg }: { msg: any }) {
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
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{msg.body}</pre>
        </div>
      )}
    </div>
  );
}
