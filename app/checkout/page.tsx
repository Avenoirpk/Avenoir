"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import ShimmerButton from "@/components/ShimmerButton";

const STEPS = ["Contact", "Delivery", "Payment", "Confirm"];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const update = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleFile = (file: File | null) => {
    setScreenshot(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null);
    }
  };

  const canPlaceOrder = screenshot !== null;

  const placeOrder = () => {
    if (!canPlaceOrder) return; // order cannot be created without payment screenshot proof
    setPlacing(true);

    const order = {
      id: "AVN-" + Math.floor(100000 + Math.random() * 900000),
      items,
      subtotal,
      customer: form,
      paymentScreenshot: screenshotPreview,
      status: "Pending Verification",
      placedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("avenoir_orders") || "[]");
      localStorage.setItem("avenoir_orders", JSON.stringify([...existing, order]));
    } catch {
      // ignore storage errors
    }

    setTimeout(() => {
      clearCart();
      router.push(`/track?order=${order.id}`);
    }, 900);
  };

  if (items.length === 0 && !placing) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-navy mb-4">Nothing to check out</h1>
        <p className="text-navy/60">Add something to your cart first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-14">
      {/* Progress stepper */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-14">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2 relative flex-1">
            <motion.div
              animate={
                i < step
                  ? { backgroundColor: "#22c55e", borderColor: "#22c55e", scale: 1 }
                  : i === step
                  ? { scale: [1, 1.15, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                i < step
                  ? "text-white"
                  : i === step
                  ? "border-2 border-navy text-navy bg-transparent"
                  : "border-2 border-navy/20 text-navy/30 bg-transparent"
              }`}
            >
              {i < step ? <Check size={16} /> : i + 1}
            </motion.div>
            <span className="text-[10px] uppercase tracking-wide text-navy/50">{s}</span>
            {i < STEPS.length - 1 && (
              <div className="absolute top-4 left-1/2 w-full h-0.5 bg-navy/10 overflow-hidden">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: "0%" }}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[2fr,1fr] gap-12">
        <div>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.section
                key="contact"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 className="font-semibold text-navy mb-2">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="border rounded-xl p-3 bg-white" />
                  <input placeholder="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="border rounded-xl p-3 bg-white" />
                  <input placeholder="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="border rounded-xl p-3 bg-white col-span-2" />
                  <input placeholder="Phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="border rounded-xl p-3 bg-white col-span-2" />
                </div>
              </motion.section>
            )}

            {step === 1 && (
              <motion.section
                key="delivery"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 className="font-semibold text-navy mb-2">Delivery Address</h2>
                <input placeholder="Street address" value={form.address} onChange={(e) => update("address", e.target.value)} className="border rounded-xl p-3 bg-white w-full" />
                <input placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className="border rounded-xl p-3 bg-white w-full" />
                <p className="text-xs text-navy/50">Free shipping · Estimated delivery 4–8 working days.</p>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="payment"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <h2 className="font-semibold text-navy mb-2">Payment — Venmo Transfer</h2>
                <div className="bg-navy text-cream rounded-3xl p-6">
                  <p className="text-sm text-cream/70 mb-1">Send payment via Venmo to:</p>
                  <p className="text-lg font-semibold">@Rizwan-Sabir</p>
                  <p className="text-sm text-cream/70 mt-1">Account name: Rizwan Sabir</p>
                  <p className="text-sm text-cream/70">Card ending: 0980</p>
                  <p className="text-2xl font-display mt-4">Rs {subtotal.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-navy mb-2">
                    Upload payment screenshot <span className="text-red-500">*required</span>
                  </p>
                  <label
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors ${
                      screenshotPreview ? "border-green-400" : "border-navy/30 hover:border-gold"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {screenshotPreview ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={screenshotPreview} alt="Payment proof" className="max-h-56 rounded-xl mb-3" />
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                            className="flex items-center gap-1 text-xs font-medium text-green-600"
                          >
                            <Check size={14} /> Screenshot uploaded
                          </motion.span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-navy/40 text-sm"
                        >
                          Tap to upload screenshot
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {!screenshot && (
                    <p className="text-xs text-red-500 mt-2">
                      Your order cannot be placed until a payment screenshot is uploaded.
                    </p>
                  )}
                </div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="confirm"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-semibold text-navy mb-4">Review & Confirm</h2>
                <div className="bg-white/60 rounded-2xl p-5 space-y-2 text-sm text-navy/70">
                  <p><strong>Name:</strong> {form.firstName} {form.lastName}</p>
                  <p><strong>Email:</strong> {form.email}</p>
                  <p><strong>Address:</strong> {form.address}, {form.city}</p>
                  <p><strong>Payment proof:</strong> {screenshot ? screenshot.name : "Not uploaded"}</p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            <button
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="text-navy/60 disabled:opacity-30"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <ShimmerButton
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={step === 2 && !canPlaceOrder}
              >
                Continue
              </ShimmerButton>
            ) : (
              <ShimmerButton onClick={placeOrder} disabled={!canPlaceOrder || placing}>
                {placing ? "Placing order…" : "Place Order"}
              </ShimmerButton>
            )}
          </div>
        </div>

        {/* Order summary */}
        <aside className="bg-white/60 rounded-3xl p-6 h-fit">
          <h3 className="font-semibold text-navy mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-64 overflow-auto mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm text-navy/70">
                <span>{item.product.name} × {item.qty}</span>
                <span>Rs {(item.product.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-navy/10 pt-4 flex justify-between font-semibold text-navy">
            <span>Total</span>
            <span>Rs {subtotal.toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
