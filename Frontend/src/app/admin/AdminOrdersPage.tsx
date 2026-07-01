import { useCallback, useEffect, useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import { useAdminAuth } from './AdminAuthContext';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ADMIN_OUTLINE_BUTTON_CLASS } from './adminButtonStyles';

interface Billing {
  firstName: string;
  lastName: string;
  company?: string;
  district: string;
  street: string;
  apartment?: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  notes?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  discountPercent?: number;
  quantity: number;
  selectedColor: string;
  category: string;
  image: string;
}

interface Order {
  id: string;
  billing: Billing;
  items: OrderItem[];
  subtotal: number | string;
  shippingFee: number | string;
  total: number | string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'paid', 'failed', 'cancelled'] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  failed: 'bg-red-500/15 text-red-300 border-red-500/30',
  cancelled: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};

function money(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  return `LKR ${Math.round(n).toLocaleString()}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function effectivePrice(item: OrderItem): number {
  return item.discountPercent && item.discountPercent > 0
    ? Math.round(item.price * (1 - item.discountPercent / 100))
    : item.price;
}

export default function AdminOrdersPage() {
  const { token, logout } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/orders', { token });
      if (res.status === 401) {
        logout();
        toast.error('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error('Failed to load orders');
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error('Invalid response');
      setOrders(raw as Order[]);
    } catch {
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(order: Order, status: string) {
    const prev = order.status;
    setOrders((list) =>
      list.map((o) => (o.id === order.id ? { ...o, status } : o)),
    );
    if (selected?.id === order.id) {
      setSelected((s) => (s ? { ...s, status } : s));
    }
    try {
      const res = await apiFetch(`/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Update failed');
      toast.success('Order status updated');
    } catch {
      toast.error('Could not update status');
      setOrders((list) =>
        list.map((o) => (o.id === order.id ? { ...o, status: prev } : o)),
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-4xl tracking-wider text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Orders
          </h1>
          <p className="text-[#F0EDE8]/60 text-sm">
            Every order placed through checkout, with the customer&apos;s
            contact and delivery details. Click the eye icon to see the full
            order, and update the status as you fulfil it.
          </p>
        </div>
        <Button
          variant="outline"
          className={ADMIN_OUTLINE_BUTTON_CLASS}
          onClick={() => load()}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border border-[#2C2C2C] bg-[#141414]/80 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-[#F0EDE8]/70">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-[#F0EDE8]/70">
            No orders yet. Orders placed at checkout will appear here.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#2C2C2C] hover:bg-transparent">
                <TableHead className="text-[#F0EDE8]">Date</TableHead>
                <TableHead className="text-[#F0EDE8]">Customer</TableHead>
                <TableHead className="text-[#F0EDE8] hidden md:table-cell">
                  Contact
                </TableHead>
                <TableHead className="text-[#F0EDE8] hidden lg:table-cell text-center">
                  Items
                </TableHead>
                <TableHead className="text-[#F0EDE8] text-right">Total</TableHead>
                <TableHead className="text-[#F0EDE8]">Status</TableHead>
                <TableHead className="text-[#F0EDE8] w-[80px] text-right">
                  View
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <TableRow key={o.id} className="border-[#2C2C2C]">
                    <TableCell className="text-[#F0EDE8]/70 text-sm whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-[#F0EDE8]">
                      {o.billing.firstName} {o.billing.lastName}
                      <span className="block text-xs text-[#F0EDE8]/50">
                        {o.billing.city}, {o.billing.district}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[#F0EDE8]/70 text-sm">
                      <span className="block">{o.billing.phone}</span>
                      <span className="block text-xs text-[#F0EDE8]/50">
                        {o.billing.email}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center tabular-nums text-[#F0EDE8]/80">
                      {itemCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#F0EDE8]">
                      {money(o.total)}
                    </TableCell>
                    <TableCell>
                      <select
                        value={o.status}
                        onChange={(e) => changeStatus(o, e.target.value)}
                        className={`h-8 rounded-md border px-2 text-xs font-medium capitalize outline-none ${
                          STATUS_STYLES[o.status] ??
                          'bg-[#0A0A0A] text-[#F0EDE8] border-[#2C2C2C]'
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-[#141414] text-[#F0EDE8]"
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-[#F0EDE8] hover:bg-[#C0392B]/20"
                        onClick={() => setSelected(o)}
                        aria-label="View order"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-[#141414] border-[#2C2C2C] text-[#F0EDE8] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Order details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[#F0EDE8]/50">
                    {formatDate(selected.createdAt)}
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[selected.status] ??
                      'border-[#2C2C2C] text-[#F0EDE8]'
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#F0EDE8]/50">
                      Customer
                    </h3>
                    <p className="font-medium">
                      {selected.billing.firstName} {selected.billing.lastName}
                    </p>
                    {selected.billing.company && (
                      <p className="text-[#F0EDE8]/70">
                        {selected.billing.company}
                      </p>
                    )}
                    <p className="text-[#F0EDE8]/70">{selected.billing.phone}</p>
                    <p className="text-[#F0EDE8]/70 break-all">
                      {selected.billing.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#F0EDE8]/50">
                      Delivery address
                    </h3>
                    <p className="text-[#F0EDE8]/70">
                      {selected.billing.street}
                    </p>
                    {selected.billing.apartment && (
                      <p className="text-[#F0EDE8]/70">
                        {selected.billing.apartment}
                      </p>
                    )}
                    <p className="text-[#F0EDE8]/70">
                      {selected.billing.city}, {selected.billing.district}
                    </p>
                    <p className="text-[#F0EDE8]/70">
                      {selected.billing.postcode}, Sri Lanka
                    </p>
                  </div>
                </div>

                {selected.billing.notes && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#F0EDE8]/50">
                      Notes
                    </h3>
                    <p className="text-[#F0EDE8]/70">{selected.billing.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#F0EDE8]/50">
                    Items
                  </h3>
                  <div className="divide-y divide-[#2C2C2C] rounded-lg border border-[#2C2C2C]">
                    {selected.items.map((item) => {
                      const sale = effectivePrice(item);
                      return (
                        <div
                          key={`${item.id}-${item.selectedColor}`}
                          className="flex items-center gap-3 p-3"
                        >
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-[#0A0A0A]">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{item.name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-[#F0EDE8]/50">
                              <span
                                className="h-3 w-3 rounded-full border border-white/20"
                                style={{ backgroundColor: item.selectedColor }}
                              />
                              <span>{item.category}</span>
                              <span>· Qty {item.quantity}</span>
                            </div>
                          </div>
                          <span className="shrink-0 tabular-nums">
                            {money(sale * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-[#2C2C2C] pt-4">
                  <div className="flex justify-between text-[#F0EDE8]/70">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {money(selected.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#F0EDE8]/70">
                    <span>Delivery</span>
                    <span className="tabular-nums">
                      {money(selected.shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums text-[#C0392B]">
                      {money(selected.total)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
