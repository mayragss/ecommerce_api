import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Product, ProductFormData } from '../models/product.model';
import { Order } from '../models/order.model';
import { Coupon, CouponFormData } from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000'; // URL da sua API
  private token = localStorage.getItem('admin_token');

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  // Auth endpoints
  login(email: string, password: string): Observable<{token: string}> {
    return this.http.post<{token: string}>(`${this.baseUrl}/auth/login`, {
      email,
      password
    });
  }

  // Users endpoints
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`, {
      headers: this.getHeaders()
    });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`, {
      headers: this.getHeaders()
    });
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, user, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Products endpoints
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`, {
      headers: this.getHeaders()
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  createProduct(product: ProductFormData): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: number, product: ProductFormData): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Orders endpoints
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`, {
      headers: this.getHeaders()
    });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}/status`, { status }, {
      headers: this.getHeaders()
    });
  }

  // Coupons endpoints
  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.baseUrl}/coupons`, {
      headers: this.getHeaders()
    });
  }

  getCoupon(id: number): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.baseUrl}/coupons/${id}`, {
      headers: this.getHeaders()
    });
  }

  createCoupon(coupon: CouponFormData): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.baseUrl}/coupons`, coupon, {
      headers: this.getHeaders()
    });
  }

  updateCoupon(id: number, coupon: CouponFormData): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.baseUrl}/coupons/${id}`, coupon, {
      headers: this.getHeaders()
    });
  }

  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/coupons/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Dashboard stats
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/stats`, {
      headers: this.getHeaders()
    });
  }

  // Dashboard comprehensive stats
  getDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard`, {
      headers: this.getHeaders()
    });
  }
}


