import React, {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { cartUnitsForProduct } from '../../lib/stock';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  colors: string[];
  image: string;
  /** Up to 5 photos; first matches `image`. */
  images?: string[];
  /** Long copy on product detail */
  description: string;
  /** Bullet lines (without leading •) */
  specifications: string[];
  /** Order preserved for size picker */
  sizes: string[];
  /** Available inventory (admin-managed). */
  stock: number;
  /** Discount percentage 1–99. Absent or 0 means no discount. */
  discountPercent?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product & { selectedColor: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | {
      type: 'UPDATE_QUANTITY';
      payload: { id: string; selectedColor: string; quantity: number };
    }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: Dispatch<CartAction>;
} | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const inCart = cartUnitsForProduct(state.items, action.payload.id);
      if (inCart >= action.payload.stock) {
        return state;
      }

      const existingItem = state.items.find(
        item => item.id === action.payload.id && item.selectedColor === action.payload.selectedColor
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.selectedColor === action.payload.selectedColor
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      const target = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.selectedColor === action.payload.selectedColor,
      );
      if (!target) {
        return state;
      }
      const inCart = cartUnitsForProduct(state.items, action.payload.id);
      const maxForLine = target.stock - (inCart - target.quantity);
      const nextQty = Math.min(
        Math.max(1, action.payload.quantity),
        Math.max(1, maxForLine),
      );
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id &&
          item.selectedColor === action.payload.selectedColor
            ? { ...item, quantity: nextQty }
            : item,
        ),
      };
    }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'CLEAR_CART':
      return { items: [], isOpen: false };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
