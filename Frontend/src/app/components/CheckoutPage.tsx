import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from './CartContext';
import type { CartItem } from './CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from './CustomCursor';

const SHIPPING_FEE = 450;
const BACKEND = import.meta.env.VITE_BACKEND_PATH ?? 'http://localhost:3000';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? '';

// PayPal temporarily disabled. Orders are placed via WhatsApp + bank transfer.
// Flip this back to `true` (and keep the PayPal block) to re-enable card payments.
const PAYPAL_ENABLED = false;

// Merchant WhatsApp Business number in international format, digits only
// (e.g. 94771234567 for Sri Lanka). Set VITE_WHATSAPP_NUMBER in your .env.
const WHATSAPP_NUMBER = (
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '94770000000'
).replace(/[^0-9]/g, '');

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

function effectivePrice(item: CartItem) {
  return item.discountPercent && item.discountPercent > 0
    ? Math.round(item.price * (1 - item.discountPercent / 100))
    : item.price;
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-[#F0EDE8]/60">
        {label}
        {required && <span className="ml-0.5 text-[#C0392B]">*</span>}
      </label>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs text-[#C0392B]">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-[#2C2C2C] bg-[#141414] px-4 py-3 text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 outline-none transition-colors focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]/40';

const inputErrCls =
  'w-full rounded-lg border border-[#C0392B]/60 bg-[#141414] px-4 py-3 text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 outline-none transition-colors focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]/40';

type FormState = {
  firstName: string; lastName: string; company: string;
  district: string; street: string; apartment: string;
  city: string; postcode: string; phone: string; email: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = 'Required';
  if (!form.lastName.trim()) errors.lastName = 'Required';
  if (!form.district) errors.district = 'Please select a district';
  if (!form.street.trim()) errors.street = 'Required';
  if (!form.city.trim()) errors.city = 'Required';
  if (!form.postcode.trim()) errors.postcode = 'Required';
  if (!form.phone.trim()) errors.phone = 'Required';
  if (!form.email.trim()) {
    errors.email = 'Required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email';
  }
  return errors;
}

function buildWhatsAppMessage(
  form: FormState,
  items: CartItem[],
  subtotal: number,
  total: number,
): string {
  const lines: string[] = [];
  lines.push('*New Order — Throttle LK*');
  lines.push('');
  lines.push('*Items*');
  items.forEach((item) => {
    const sale = effectivePrice(item);
    lines.push(
      `• ${item.name} (${item.category}) x${item.quantity} — LKR ${(
        sale * item.quantity
      ).toLocaleString()}`,
    );
  });
  lines.push('');
  lines.push(`Subtotal: LKR ${subtotal.toLocaleString()}`);
  lines.push(`Island Wide Delivery: LKR ${SHIPPING_FEE.toLocaleString()}`);
  lines.push(`*Total: LKR ${total.toLocaleString()}*`);
  lines.push('');
  lines.push('*Customer*');
  lines.push(`Name: ${form.firstName} ${form.lastName}`);
  if (form.company) lines.push(`Company: ${form.company}`);
  lines.push(`Phone: ${form.phone}`);
  lines.push(`Email: ${form.email}`);
  lines.push('');
  lines.push('*Delivery Address*');
  lines.push(form.apartment ? `${form.street}, ${form.apartment}` : form.street);
  lines.push(`${form.city}, ${form.district}`);
  lines.push(`Postcode: ${form.postcode}`);
  lines.push('Sri Lanka');
  if (form.notes) {
    lines.push('');
    lines.push(`*Notes:* ${form.notes}`);
  }
  lines.push('');
  lines.push('Please share your bank account details so I can pay and send the deposit slip. Thank you!');
  return lines.join('\n');
}

function SuccessScreen({ orderId, onContinue }: { orderId: string; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-6 py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1a2e1a]">
        <CheckCircle2 className="h-10 w-10 text-[#27ae60]" />
      </div>
      <div>
        <h2
          className="mb-2 text-4xl tracking-wider text-[#F0EDE8]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Order Confirmed!
        </h2>
        <p className="text-sm text-[#F0EDE8]/60">
          Thank you for your purchase. Your payment was successful.
        </p>
        {orderId && (
          <p className="mt-2 text-xs text-[#F0EDE8]/35">
            Order ID: <span className="font-mono text-[#F0EDE8]/50">{orderId}</span>
          </p>
        )}
      </div>
      <motion.button
        type="button"
        onClick={onContinue}
        className="mt-2 rounded-xl bg-[#C0392B] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white hover:bg-[#a93226]"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        Continue Shopping
      </motion.button>
    </motion.div>
  );
}

function CheckoutInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', company: '',
    district: '', street: '', apartment: '',
    city: '', postcode: '', phone: '', email: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string } | null>(null);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const subtotal = state.items.reduce(
    (s, item) => s + effectivePrice(item) * item.quantity, 0
  );
  const total = subtotal + SHIPPING_FEE;
  const hasItems = state.items.length > 0;

  const getInputCls = (key: keyof FormState) =>
    errors[key] ? inputErrCls : inputCls;

  const handleWhatsAppOrder = () => {
    const formErrors = validateForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const message = buildWhatsAppMessage(form, state.items, subtotal, total);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]" style={{ fontFamily: "'DM Sans', sans-serif", cursor: 'none' }}>
        <CustomCursor />
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 pt-28">
          <SuccessScreen
            orderId={orderSuccess.orderId}
            onContinue={() => {
              dispatch({ type: 'CLEAR_CART' });
              navigate('/');
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]" style={{ fontFamily: "'DM Sans', sans-serif", cursor: 'none' }}>
      <CustomCursor />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <motion.button
          type="button"
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-sm text-[#F0EDE8]/50 transition-colors hover:text-[#F0EDE8]"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </motion.button>

        <h1
          className="mb-10 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Checkout
        </h1>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* ── LEFT: Billing form ── */}
          <div className="space-y-8">
            <section>
              <h2
                className="mb-6 text-2xl tracking-wider text-[#F0EDE8]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Billing Details
              </h2>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First Name" required error={errors.firstName}>
                    <input
                      className={getInputCls('firstName')}
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={set('firstName')}
                    />
                  </Field>
                  <Field label="Last Name" required error={errors.lastName}>
                    <input
                      className={getInputCls('lastName')}
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={set('lastName')}
                    />
                  </Field>
                </div>

                <Field label="Company Name (optional)">
                  <input
                    className={inputCls}
                    placeholder="Company Name"
                    value={form.company}
                    onChange={set('company')}
                  />
                </Field>

                <Field label="Country / Region" required>
                  <div className="relative">
                    <input
                      className={`${inputCls} cursor-default`}
                      value="Sri Lanka"
                      readOnly
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0EDE8]/30 text-xs">
                      🇱🇰
                    </span>
                  </div>
                </Field>

                <Field label="Street Address" required error={errors.street}>
                  <input
                    className={getInputCls('street')}
                    placeholder="House number and street name"
                    value={form.street}
                    onChange={set('street')}
                  />
                  <input
                    className={inputCls}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    value={form.apartment}
                    onChange={set('apartment')}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Town / City" required error={errors.city}>
                    <input
                      className={getInputCls('city')}
                      placeholder="City"
                      value={form.city}
                      onChange={set('city')}
                    />
                  </Field>
                  <Field label="District" required error={errors.district}>
                    <div className="relative">
                      <select
                        className={`${getInputCls('district')} appearance-none pr-9`}
                        value={form.district}
                        onChange={set('district')}
                      >
                        <option value="">Select district</option>
                        {SRI_LANKA_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F0EDE8]/30" />
                    </div>
                  </Field>
                </div>

                <Field label="Postcode / ZIP" required error={errors.postcode}>
                  <input
                    className={getInputCls('postcode')}
                    placeholder="Postcode"
                    value={form.postcode}
                    onChange={set('postcode')}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone" required error={errors.phone}>
                    <input
                      className={getInputCls('phone')}
                      placeholder="+94 77 000 0000"
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                    />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <input
                      className={getInputCls('email')}
                      placeholder="you@example.com"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section>
              <Field label="Order Notes (optional)">
                <textarea
                  className={`${inputCls} min-h-[100px] resize-y`}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  value={form.notes}
                  onChange={set('notes')}
                  rows={4}
                />
              </Field>
            </section>
          </div>

          {/* ── RIGHT: Order summary ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#2C2C2C] bg-[#141414] overflow-hidden">
              <div className="border-b border-[#2C2C2C] px-6 py-4">
                <h2
                  className="text-2xl tracking-wider text-[#F0EDE8]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Your Order
                </h2>
              </div>

              {!hasItems ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <ShoppingBag className="h-10 w-10 text-[#F0EDE8]/20" />
                  <p className="text-sm text-[#F0EDE8]/40">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="divide-y divide-[#2C2C2C]">
                    {state.items.map((item) => {
                      const sale = effectivePrice(item);
                      const hasDiscount = item.discountPercent && item.discountPercent > 0;
                      return (
                        <div key={`${item.id}-${item.selectedColor}`} className="flex gap-4 px-6 py-4">
                          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#0A0A0A]">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#C0392B] text-[10px] font-bold text-white">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col justify-center gap-0.5 min-w-0">
                            <p className="truncate text-sm font-medium text-[#F0EDE8]">{item.name}</p>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: item.selectedColor }}
                              />
                              <span className="text-xs text-[#F0EDE8]/40">{item.category}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-center gap-0.5 shrink-0">
                            <span className="text-sm font-medium text-[#F0EDE8]">
                              LKR {(sale * item.quantity).toLocaleString()}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-[#F0EDE8]/35 line-through">
                                LKR {(item.price * item.quantity).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t border-[#2C2C2C] px-6 py-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F0EDE8]/60">Subtotal</span>
                      <span className="text-[#F0EDE8]">LKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F0EDE8]/60">Island Wide Delivery</span>
                      <span className="text-[#F0EDE8]">LKR {SHIPPING_FEE.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#2C2C2C] pt-3">
                      <span
                        className="text-lg tracking-wide text-[#F0EDE8]"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        Total
                      </span>
                      <span
                        className="text-lg text-[#C0392B]"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        LKR {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="border-t border-[#2C2C2C] px-6 pb-6 pt-5">
                  {!PAYPAL_ENABLED ? (
                    <>
                      <p
                        className="mb-4 text-sm tracking-wider text-[#F0EDE8]/60 uppercase"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        Pay via WhatsApp
                      </p>

                      <motion.button
                        type="button"
                        onClick={handleWhatsAppOrder}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-[#0A0A0A] transition-colors hover:bg-[#1ebe5a]"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <MessageCircle className="h-5 w-5" />
                        Pay Now via WhatsApp
                      </motion.button>

                      <div className="mt-4 rounded-lg border border-[#2C2C2C] bg-[#0A0A0A] p-4 text-xs leading-relaxed text-[#F0EDE8]/50">
                        <p className="mb-2 font-semibold text-[#F0EDE8]/70">How it works</p>
                        <ol className="list-decimal space-y-1 pl-4">
                          <li>Tap the button — your order details open in WhatsApp.</li>
                          <li>Send the message to us.</li>
                          <li>We reply with our bank account details.</li>
                          <li>Pay and send us the deposit slip.</li>
                          <li>We confirm and deliver island-wide.</li>
                        </ol>
                      </div>

                      <p className="mt-3 text-center text-xs text-[#F0EDE8]/30">
                        By placing your order you agree to our terms &amp; conditions.
                      </p>
                    </>
                  ) : (
                    <>
                    <p
                      className="mb-4 text-sm tracking-wider text-[#F0EDE8]/60 uppercase"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      Pay with PayPal
                    </p>

                    <AnimatePresence>
                      {paypalError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 flex items-start gap-2 rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 p-3 text-xs text-[#C0392B]"
                        >
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {paypalError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!PAYPAL_CLIENT_ID ? (
                      <div className="rounded-lg border border-[#2C2C2C] bg-[#0A0A0A] p-4 text-center text-xs text-[#F0EDE8]/40">
                        PayPal not configured. Set{' '}
                        <code className="font-mono text-[#F0EDE8]/60">VITE_PAYPAL_CLIENT_ID</code>{' '}
                        in your <code className="font-mono text-[#F0EDE8]/60">.env</code> file.
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-xl">
                        <PayPalButtons
                          style={{
                            layout: 'vertical',
                            color: 'gold',
                            shape: 'rect',
                            label: 'pay',
                            height: 48,
                          }}
                          createOrder={async () => {
                            setPaypalError(null);

                            // Validate form first
                            const formErrors = validateForm(form);
                            if (Object.keys(formErrors).length > 0) {
                              setErrors(formErrors);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              throw new Error('Please fill in all required billing fields.');
                            }

                            const res = await fetch(`${BACKEND}/orders`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                billing: {
                                  firstName: form.firstName,
                                  lastName: form.lastName,
                                  company: form.company || undefined,
                                  district: form.district,
                                  street: form.street,
                                  apartment: form.apartment || undefined,
                                  city: form.city,
                                  postcode: form.postcode,
                                  phone: form.phone,
                                  email: form.email,
                                  notes: form.notes || undefined,
                                },
                                items: state.items.map((item) => ({
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  discountPercent: item.discountPercent,
                                  quantity: item.quantity,
                                  selectedColor: item.selectedColor,
                                  category: item.category,
                                  image: item.image,
                                })),
                              }),
                            });

                            if (!res.ok) {
                              const err = await res.json().catch(() => ({})) as { message?: string };
                              throw new Error(err.message ?? 'Failed to create order. Please try again.');
                            }

                            const data = await res.json() as { paypalOrderId: string };
                            return data.paypalOrderId;
                          }}
                          onApprove={async (data) => {
                            setPaypalError(null);
                            const res = await fetch(
                              `${BACKEND}/orders/${data.orderID}/capture`,
                              { method: 'POST' },
                            );

                            if (!res.ok) {
                              setPaypalError('Payment capture failed. Please contact support.');
                              return;
                            }

                            const result = await res.json() as { success: boolean; orderId: string };
                            if (result.success) {
                              setOrderSuccess({ orderId: result.orderId });
                            } else {
                              setPaypalError('Payment was not completed. Please try again.');
                            }
                          }}
                          onError={(err) => {
                            console.error('PayPal error:', err);
                            const msg = err instanceof Error ? err.message : String(err);
                            if (msg && !msg.includes('window')) {
                              setPaypalError(msg);
                            }
                          }}
                          onCancel={() => {
                            setPaypalError('Payment cancelled. You can try again whenever you are ready.');
                          }}
                        />
                      </div>
                    )}

                    <p className="mt-3 text-center text-xs text-[#F0EDE8]/30">
                      By placing your order you agree to our terms &amp; conditions.
                    </p>
                    </>
                  )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID || 'test',
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <CheckoutInner />
    </PayPalScriptProvider>
  );
}
