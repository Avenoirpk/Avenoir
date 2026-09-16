"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STATUSES = ["Pending Verification", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const STATUS_COLORS: Record<string, string> = {
  "Pending Verification": "bg-amber-100 text-amber-700",
  "Confirmed": "bg-blue-100 text-blue-700",
  "Packed": "bg-indigo-100 text-indigo-700",
  "Shipped": "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  "Delivered": "bg-green-100 text-green-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      setOrders(JSON.parse(localStorage.getItem("avenoir_orders") || "[]"));
    } catch {
      setOrders([]);
    }
  }, []);

  const updateStatus = (id: string, status: string) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated);
    localStorage.setItem("avenoir_orders", JSON.stringify(updated));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-14">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-4xl text-navy">Orders</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="text-navy/50 hover:text-navy">Dashboard</Link>
          <Link href="/admin/orders" className="text-navy font-medium">Orders</Link>
          <Link href="/admin/products" className="text-navy/50 hover:text-navy">Products</Link>
        </nav>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
              className="bg-white/60 rounded-3xl p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy">{o.id}</p>
                    <motion.span
                      key={o.status}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        STATUS_COLORS[o.status] ?? "bg-navy/10 text-navy/60"
                      }`}
                    >
                      {o.status}
                    </motion.span>
                  </div>
                  <p className="text-xs text-navy/50">{o.customer?.firstName} {o.customer?.lastName} · {o.customer?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="border rounded-full px-4 py-2 text-sm bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    className="text-sm text-gold hover:underline"
                  >
                    {expanded === o.id ? "Hide" : "View proof"}
                  </motion.button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {expanded === o.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid md:grid-cols-2 gap-6 border-t border-navy/10 pt-4">
                      <div>
                        <p className="text-xs text-navy/50 mb-2">Payment Screenshot</p>
                        {o.paymentScreenshot ? (
                          <motion.img
                            whileHover={{ scale: 1.03 }}
                            onClick={() => setZoomImage(o.paymentScreenshot)}
                            src={o.paymentScreenshot}
                            alt="Payment proof"
                            className="rounded-xl max-h-64 border cursor-zoom-in"
                          />
                        ) : (
                          <p className="text-red-500 text-sm">No screenshot on file.</p>
                        )}
                      </div>
                      <div className="text-sm text-navy/70 space-y-1">
                        <p><strong>Address:</strong> {o.customer?.address}, {o.customer?.city}</p>
                        <p><strong>Total:</strong> Rs {o.subtotal?.toLocaleString()}</p>
                        <p className="pt-2 font-medium text-navy">Items</p>
                        {o.items?.map((it: any) => (
                          <p key={it.product.id}>{it.product.name} × {it.qty}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {orders.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-navy/40"
          >
            No orders placed yet.
          </motion.p>
        )}
      </div>

      {/* SCREENSHOT ZOOM MODAL */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={zoomImage} alt="Payment proof (zoomed)" className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl" />
              <button
                onClick={() => setZoomImage(null)}
                aria-label="Close"
                className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy shadow-lg"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
