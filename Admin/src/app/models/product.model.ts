export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  collection?: string;
  attributes?: any;
  images?: any;
  imageUrl?: string;
  sold?: number;
  views?: number;
  priority?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  collection?: string;
  attributes?: any;
  images?: any;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  priority?: number;
}


