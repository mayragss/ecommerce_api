import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Order } from '../../models/order.model';
import { PaymentProofFormData } from '../../models/payment-proof.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  searchTerm = '';
  selectedStatus = '';
  selectedPeriod = '';
  sortBy = 'newest';
  
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  selectedOrder: Order | null = null;
  newStatus = '';
  paidAmount: number | null = null;
  selectedFile: File | null = null;
  observations: string = '';
  
  saving = false;
  loading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.apiService.getOrders().subscribe({
      next: (orders) => {
        // Mapear User para user e garantir que items esteja disponível
        this.orders = orders.map(order => {
          const mappedOrder = {
            ...order,
            user: order.User || order.user,
            items: order.items || (order as any).OrderItems || (order as any).items || []
          };
          return mappedOrder;
        });
        this.filterOrders();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  refreshOrders() {
    this.loadOrders();
  }

  filterOrders() {
    let filtered = [...this.orders];

    // Filtrar por termo de busca
    if (this.searchTerm) {
      filtered = filtered.filter(o => 
        o.id.toString().includes(this.searchTerm) ||
        o.user?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (this.selectedStatus) {
      filtered = filtered.filter(o => o.status === this.selectedStatus);
    }

    // Filtrar por período
    if (this.selectedPeriod) {
      const now = new Date();
      const orderDate = new Date();
      
      filtered = filtered.filter(o => {
        orderDate.setTime(new Date(o.createdAt).getTime());
        
        switch (this.selectedPeriod) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return orderDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.total - a.total;
        case 'lowest':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    this.filteredOrders = filtered;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPeriod = '';
    this.sortBy = 'newest';
    this.filterOrders();
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

  getPaymentMethodText(method: string): string {
    const methods: { [key: string]: string } = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'pix': 'PIX',
      'boleto': 'Boleto',
      'cash': 'Dinheiro'
    };
    return methods[method] || method;
  }

  getOrderItemsCount(order: Order): number {
    // Verificar diferentes possíveis nomes de propriedade
    const items = order.items || (order as any).OrderItems || (order as any).items || [];
    
    if (Array.isArray(items) && items.length > 0) {
      return items.length;
    }
    
    return 0;
  }

  getOrderItems(order: Order): any[] {
    // Verificar diferentes possíveis nomes de propriedade
    const items = order.items || (order as any).OrderItems || (order as any).items || [];
    
    if (Array.isArray(items)) {
      return items;
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

  updateOrderStatus(order: Order) {
    this.selectedOrder = order;
    this.newStatus = order.status;
    this.paidAmount = null;
    this.selectedFile = null;
    this.observations = '';
    
    // Abrir modal de atualização de status
    const modal = document.getElementById('statusUpdateModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  saveStatusUpdate() {
    if (!this.selectedOrder) return;
    
    this.saving = true;
    
    // Primeiro atualizar o status do pedido
    console.log('Atualizando status para:', this.newStatus);
    this.apiService.updateOrderStatus(this.selectedOrder.id, this.newStatus).subscribe({
      next: (order) => {
        console.log('Pedido atualizado recebido:', order);
        console.log('Status do pedido:', order.status);
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = order;
          this.filterOrders();
        }
        
        // Se houver valor pago ou comprovante, salvar o comprovativo
        if (this.paidAmount || this.selectedFile || this.observations) {
          const amount = this.paidAmount || order.total;
          this.apiService.createPaymentProof({
            orderId: order.id,
            amount: amount,
            document: this.selectedFile || undefined,
            observations: this.observations || undefined
          }).subscribe({
            next: () => {
              this.closeStatusModal();
              this.saving = false;
            },
            error: (error) => {
              console.error('Error creating payment proof:', error);
              this.closeStatusModal();
              this.saving = false;
            }
          });
        } else {
          this.closeStatusModal();
          this.saving = false;
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.saving = false;
      }
    });
  }

  exportOrders() {
    // Implementar exportação de pedidos
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateCSV(): string {
    const headers = ['ID', 'Cliente', 'Email', 'Total', 'Status', 'Pagamento', 'Data'];
    const rows = this.filteredOrders.map(order => [
      order.id,
      order.user?.name || 'N/A',
      order.user?.email || 'N/A',
      order.total,
      this.getStatusText(order.status),
      this.getPaymentMethodText(order.paymentStatus as any),
      this.formatDate(order.createdAt)
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  closeStatusModal() {
    const modal = document.getElementById('statusUpdateModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
    // Limpar campos ao fechar
    this.paidAmount = null;
    this.selectedFile = null;
    this.observations = '';
  }

  getUserPhone(user: Order['user'] | null | undefined): string {
    return (user as any)?.phone || 'N/A';
  }

  orderToDelete: Order | null = null;

  deleteOrder(order: Order) {
    this.orderToDelete = order;
    const modal = document.getElementById('deleteOrderModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  confirmDeleteOrder() {
    if (!this.orderToDelete) return;

    this.apiService.deleteOrder(this.orderToDelete.id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== this.orderToDelete!.id);
        this.filterOrders();
        this.closeDeleteOrderModal();
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        alert('Erro ao excluir pedido. Tente novamente.');
        this.closeDeleteOrderModal();
      }
    });
  }

  closeDeleteOrderModal() {
    const modal = document.getElementById('deleteOrderModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
    this.orderToDelete = null;
  }
}