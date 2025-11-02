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
  selectedOrder: Order | null = null;

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
    if (!status || status.trim() === '') {
      return 'badge-pending';
    }
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-pending',
      'awaiting_treatment': 'badge-awaiting-treatment',
      'paid': 'badge-paid',
      'shipped': 'badge-shipped',
      'delivered': 'badge-delivered',
      'cancelled': 'badge-cancelled'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  getStatusText(status: string): string {
    if (!status || status.trim() === '') {
      return 'Pendente';
    }
    const statusTexts: { [key: string]: string } = {
      'pending': 'Pendente',
      'awaiting_treatment': 'Aguardando Tratamento',
      'paid': 'Pago',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusTexts[status] || status;
  }

  getOrderItems(order: Order): any[] {
    if (order.items && Array.isArray(order.items)) {
      return order.items;
    }
    return [];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  viewOrder(order: Order) {
    this.selectedOrder = order;
    
    // Abrir modal de detalhes
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }
}