import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCart, type CartItem } from './CartContext';
import { cartUnitsForProduct } from '../../lib/stock';

export default function CartDrawer() {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const SHIPPING_FEE = 450;

  const effectivePrice = (item: CartItem) =>
    item.discountPercent && item.discountPercent > 0
      ? Math.round(item.price * (1 - item.discountPercent / 100))
      : item.price;

  const subtotal = state.items.reduce(
    (sum, item) => sum + effectivePrice(item) * item.quantity,
    0
  );

  const updateQuantity = (item: CartItem, delta: number) => {
    const inCart = cartUnitsForProduct(state.items, item.id);
    if (delta > 0 && inCart >= item.stock) {
      return;
    }
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: {
          id: item.id,
          selectedColor: item.selectedColor,
          quantity: newQuantity,
        },
      });
    } else {
      dispatch({ type: 'REMOVE_ITEM', payload: item.id });
    }
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#2C2C2C] z-[101] overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2
                  className="text-3xl text-[#F0EDE8] tracking-wider"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Your Cart
                </h2>
                <motion.button
                  onClick={() => dispatch({ type: 'CLOSE_CART' })}
                  className="text-[#F0EDE8] hover:text-[#C0392B]"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {state.items.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ShoppingBag className="w-16 h-16 text-[#F0EDE8]/20 mb-4" />
                  <p
                    className="text-[#F0EDE8]/60 text-center"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Your cart is empty.
                    <br />
                    Time to gear up.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-6 mb-8">
                    {state.items.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.selectedColor}`}
                        className="flex gap-4 bg-[#0A0A0A] p-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-32 object-cover"
                        />

                        <div className="flex-1">
                          <h3
                            className="text-[#F0EDE8] mb-2 tracking-wide"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            {item.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full border border-[#F0EDE8]"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                            <span
                              className="text-[#F0EDE8]/60 text-sm"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {item.category}
                            </span>
                          </div>

                          {item.discountPercent && item.discountPercent > 0 ? (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                              <span
                                className="text-[#C0392B] font-medium"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                LKR {effectivePrice(item).toLocaleString()}
                              </span>
                              <span
                                className="text-xs text-[#F0EDE8]/35 line-through"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                LKR {item.price.toLocaleString()}
                              </span>
                              <span className="rounded bg-[#C0392B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                -{item.discountPercent}%
                              </span>
                            </div>
                          ) : (
                            <p
                              className="text-[#C0392B] mb-4"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              LKR {item.price.toLocaleString()}
                            </p>
                          )}

                          <div className="flex items-center gap-3">
                            <motion.button
                              onClick={() => updateQuantity(item, -1)}
                              className="w-8 h-8 bg-[#2C2C2C]/40 backdrop-blur-md flex items-center justify-center hover:bg-[#C0392B]/30 transition-colors border border-[#F0EDE8]/10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="w-4 h-4 text-[#F0EDE8]" />
                            </motion.button>

                            <span
                              className="text-[#F0EDE8] w-8 text-center"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {item.quantity}
                            </span>

                            <motion.button
                              onClick={() => updateQuantity(item, 1)}
                              disabled={
                                cartUnitsForProduct(state.items, item.id) >=
                                item.stock
                              }
                              className="w-8 h-8 bg-[#2C2C2C]/40 backdrop-blur-md flex items-center justify-center hover:bg-[#C0392B]/30 transition-colors border border-[#F0EDE8]/10 disabled:cursor-not-allowed disabled:opacity-40"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-4 h-4 text-[#F0EDE8]" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-[#0A0A0A] pt-6 space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[#F0EDE8]/70 text-sm tracking-wide"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Subtotal
                      </span>
                      <span
                        className="text-[#F0EDE8] text-sm"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        LKR {subtotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between items-center">
                      <span
                        className="text-[#F0EDE8]/70 text-sm tracking-wide"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Island Wide Delivery
                      </span>
                      <span
                        className="text-[#F0EDE8] text-sm"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        LKR {SHIPPING_FEE.toLocaleString()}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#F0EDE8]/10 pt-3">
                      <div className="flex justify-between items-center">
                        <span
                          className="text-[#F0EDE8] text-xl tracking-wide"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          Total
                        </span>
                        <span
                          className="text-[#C0392B] text-xl"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          LKR {(subtotal + SHIPPING_FEE).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3">
                      <motion.button
                        onClick={() => {
                          dispatch({ type: 'CLOSE_CART' });
                          navigate('/checkout');
                        }}
                        className="w-full bg-[#C0392B] text-white py-4 tracking-wider font-semibold uppercase shadow-lg shadow-[#C0392B]/25 hover:bg-[#a93226] transition-all rounded-xl"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Proceed to Checkout
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
