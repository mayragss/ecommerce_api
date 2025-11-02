export interface Order {
  id: number;
  userId: number;
  status: 'pending' | 'awaiting_treatment' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  total: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  User?: {
    id: number;
    name: string;
    email: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}









