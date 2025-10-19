import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  };
  
  recentOrders: Order[] = [];
  topProducts: Product[] = [];
  loading = false;
  currentDate = new Date();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Carregar estatísticas
    this.apiService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    });

    // Carregar pedidos recentes
    this.loadOrders();
    
    // Carregar produtos mais vendidos
    this.loadTopProducts();
  }

  loadOrders() {
    this.apiService.getOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 5); // Últimos 5 pedidos
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
        this.recentOrders = [];
      }
    });
  }

  loadTopProducts() {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        // Ordenar por vendas e pegar os top 5
        this.topProducts = products
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading top products:', error);
        this.topProducts = [];
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-pending',
      'paid': 'badge-paid',
      'shipped': 'badge-shipped',
      'delivered': 'badge-delivered',
      'cancelled': 'badge-cancelled'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusTexts[status] || status;
  }

  viewOrder(order: Order) {
    // Implementar visualização do pedido
    console.log('View order:', order);
  }
}