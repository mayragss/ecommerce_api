export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  userId: number;
}

