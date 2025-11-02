import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Product, ProductFormData } from '../models/product.model';
import { Order } from '../models/order.model';
import { Coupon, CouponFormData } from '../models/coupon.model';
import { PaymentProof, PaymentProofFormData } from '../models/payment-proof.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
    const formData = this.createProductFormData(product);
    return this.http.post<Product>(`${this.baseUrl}/products`, formData, {
      headers: this.getHeadersForFormData()
    });
  }

  updateProduct(id: number, product: ProductFormData): Observable<Product> {
    const formData = this.createProductFormData(product);
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, formData, {
      headers: this.getHeadersForFormData()
    });
  }

  private createProductFormData(product: ProductFormData): FormData {
    const formData = new FormData();
    
    // Adicionar campos básicos
    formData.append('name', product.name);
    formData.append('description', product.description || '');
    formData.append('price', product.price.toString());
    formData.append('stock', product.stock.toString());
    formData.append('category', product.category);
    formData.append('collection', product.collection || '');
    formData.append('priority', (product.priority || 1).toString());
    
    // Adicionar atributos como JSON
    if (product.attributes) {
      formData.append('attributes', JSON.stringify(product.attributes));
    }
    
    // Separar imagens existentes (strings) das novas (Files)
    const existingImages: string[] = [];
    const newImages: File[] = [];
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((image) => {
        if (image instanceof File) {
          newImages.push(image);
        } else if (typeof image === 'string') {
          existingImages.push(image);
        }
      });
    }
    
    console.log('=== FORM DATA DEBUG ===');
    console.log('Total images:', product.images?.length || 0);
    console.log('New images (Files):', newImages.length);
    console.log('Existing images (strings):', existingImages.length);
    console.log('New images details:', newImages.map(img => ({ name: img.name, size: img.size, type: img.type })));
    
    // Adicionar apenas as novas imagens (Files) ao FormData
    newImages.forEach((image, index) => {
      console.log(`Adding image ${index}:`, image.name, image.size, image.type);
      formData.append('images', image);
    });
    
    // Adicionar imagens existentes como JSON para o backend processar
    if (existingImages.length > 0) {
      console.log('Existing images:', existingImages);
      formData.append('existingImages', JSON.stringify(existingImages));
    }
    
    return formData;
  }

  private getHeadersForFormData(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Não definir Content-Type para FormData - o browser define automaticamente
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

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orders/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Payment Proof endpoints
  createPaymentProof(paymentProof: PaymentProofFormData): Observable<PaymentProof> {
    const formData = new FormData();
    formData.append('orderId', paymentProof.orderId.toString());
    formData.append('amount', paymentProof.amount.toString());
    
    if (paymentProof.document) {
      formData.append('document', paymentProof.document);
    }
    
    if (paymentProof.observations) {
      formData.append('observations', paymentProof.observations);
    }
    
    return this.http.post<PaymentProof>(`${this.baseUrl}/payment-proofs`, formData, {
      headers: this.getHeadersForFormData()
    });
  }

  getPaymentProofsByOrder(orderId: number): Observable<PaymentProof[]> {
    return this.http.get<PaymentProof[]>(`${this.baseUrl}/payment-proofs/order/${orderId}`, {
      headers: this.getHeaders()
    });
  }

  getPaymentProof(id: number): Observable<PaymentProof> {
    return this.http.get<PaymentProof>(`${this.baseUrl}/payment-proofs/${id}`, {
      headers: this.getHeaders()
    });
  }

  deletePaymentProof(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/payment-proofs/${id}`, {
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


