import type { CartItem, Product } from '../app/components/CartContext';

export function cartUnitsForProduct(items: CartItem[], productId: string): number {
  return items
    .filter((item) => item.id === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function remainingStock(product: Pick<Product, 'id' | 'stock'>, items: CartItem[]): number {
  return Math.max(0, product.stock - cartUnitsForProduct(items, product.id));
}

export function isSoldOut(product: Pick<Product, 'stock'>): boolean {
  return product.stock <= 0;
}
