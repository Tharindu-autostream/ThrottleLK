import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

interface BillingInfo {
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

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json' })
  billing: BillingInfo;

  @Column({ type: 'json' })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  /** Amount charged to PayPal (converted from LKR) */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paypalTotal: number;

  /** Currency used for the PayPal transaction (e.g. USD) */
  @Column({ default: 'USD' })
  paypalCurrency: string;

  @Column({ nullable: true })
  paypalOrderId: string;

  @Column({ nullable: true })
  paypalCaptureId: string;

  /** pending | paid | failed | cancelled */
  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
