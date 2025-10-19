import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Coupon, CouponFormData } from '../../models/coupon.model';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  filteredCoupons: Coupon[] = [];
  
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';
  
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  editingCoupon: Coupon | null = null;
  selectedCoupon: Coupon | null = null;
  couponFormData: CouponFormData = {
    code: '',
    description: '',
    discountType: 'fixed',
    discountValue: 0,
    minOrderValue: undefined,
    maxDiscount: undefined,
    usageLimit: 1,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(new Date().getTime() + 7*24*60*60*1000).toISOString()
  };
  
  saving = false;
  loading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.loading = true;
    this.apiService.getCoupons().subscribe({
      next: (coupons) => {
        this.coupons = coupons;
        this.filterCoupons();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading coupons:', error);
        this.loading = false;
      }
    });
  }

  filterCoupons() {
    let filtered = [...this.coupons];

    // Filtrar por termo de busca
    if (this.searchTerm) {
      filtered = filtered.filter(c => 
        c.code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (this.selectedType) {
      filtered = filtered.filter(c => c.discountType === this.selectedType);
    }

    // Filtrar por status
    if (this.selectedStatus) {
      filtered = filtered.filter(c => {
        switch (this.selectedStatus) {
          case 'active':
            return c.isActive && !this.isExpired(c) && !this.isExhausted(c);
          case 'expired':
            return this.isExpired(c);
          case 'exhausted':
            return this.isExhausted(c);
          default:
            return true;
        }
      });
    }

    this.filteredCoupons = filtered;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredCoupons.length / this.itemsPerPage);
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
    this.selectedType = '';
    this.selectedStatus = '';
    this.filterCoupons();
  }

  getTypeClass(type: string): string {
    return type === 'fixed' ? 'badge-fixed' : 'badge-percentage';
  }

  getTypeText(type: string): string {
    return type === 'fixed' ? 'Valor Fixo' : 'Porcentagem';
  }

  formatValue(coupon: Coupon): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      return `R$ ${coupon.discountValue.toFixed(2)}`;
    }
  }

  getUsagePercentage(coupon: Coupon): number {
    if (!coupon.usageLimit) return 0;
    return Math.min(100, ((coupon.usedCount || 0) / coupon.usageLimit) * 100);
  }

  getUsageClass(coupon: Coupon): string {
    const percentage = this.getUsagePercentage(coupon);
    if (percentage >= 100) return 'progress-bar-danger';
    if (percentage >= 80) return 'progress-bar-warning';
    return 'progress-bar-success';
  }

  isExpired(coupon: Coupon): boolean {
    return new Date(coupon.validUntil) < new Date();
  }

  isExhausted(coupon: Coupon): boolean {
    return coupon.usageLimit ? (coupon.usedCount || 0) >= coupon.usageLimit : false;
  }

  getStatusClass(coupon: Coupon): string {
    if (!coupon.isActive) return 'badge-exhausted';
    if (this.isExpired(coupon)) return 'badge-expired';
    if (this.isExhausted(coupon)) return 'badge-exhausted';
    return 'badge-active';
  }

  getStatusText(coupon: Coupon): string {
    if (!coupon.isActive) return 'Inativo';
    if (this.isExpired(coupon)) return 'Expirado';
    if (this.isExhausted(coupon)) return 'Esgotado';
    return 'Ativo';
  }

  getExpirationClass(coupon: Coupon): string {
    const daysUntilExpiry = this.getDaysUntilExpiry(coupon);
    if (daysUntilExpiry < 0) return 'text-danger';
    if (daysUntilExpiry <= 7) return 'text-warning';
    return 'text-success';
  }

  getExpirationText(coupon: Coupon): string {
    const daysUntilExpiry = this.getDaysUntilExpiry(coupon);
    if (daysUntilExpiry < 0) return 'Expirado';
    if (daysUntilExpiry === 0) return 'Expira hoje';
    if (daysUntilExpiry === 1) return 'Expira amanhã';
    return `Expira em ${daysUntilExpiry} dias`;
  }

  getDaysUntilExpiry(coupon: Coupon): number {
    const now = new Date();
    const expiry = new Date(coupon.validUntil);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  openCouponModal(coupon?: Coupon) {
    this.editingCoupon = coupon || null;
    
    if (coupon) {
      this.couponFormData = {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil
      };
    } else {
      this.couponFormData = {
        code: '',
        description: '',
        discountType: 'fixed',
        discountValue: 0,
        minOrderValue: undefined,
        maxDiscount: undefined,
        usageLimit: 1,
        isActive: true,
        validFrom: new Date().toISOString(),
        validUntil: new Date(new Date().getTime() + 7*24*60*60*1000).toISOString()
      };
    }

    // Abrir modal
    const modal = document.getElementById('couponModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  viewCoupon(coupon: Coupon) {
    this.selectedCoupon = coupon;
    
    // Abrir modal de detalhes
    const modal = document.getElementById('couponDetailsModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  saveCoupon() {
    if (this.editingCoupon) {
      this.updateCoupon();
    } else {
      this.createCoupon();
    }
  }

  createCoupon() {
    this.saving = true;
    const couponData = { ...this.couponFormData };
    
    this.apiService.createCoupon(couponData).subscribe({
      next: (coupon) => {
        this.coupons.unshift(coupon);
        this.filterCoupons();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error creating coupon:', error);
        this.saving = false;
      }
    });
  }

  updateCoupon() {
    if (!this.editingCoupon) return;
    
    this.saving = true;
    const couponData = { ...this.couponFormData };
    
    this.apiService.updateCoupon(this.editingCoupon.id, couponData).subscribe({
      next: (coupon) => {
        const index = this.coupons.findIndex(c => c.id === coupon.id);
        if (index !== -1) {
          this.coupons[index] = coupon;
          this.filterCoupons();
        }
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating coupon:', error);
        this.saving = false;
      }
    });
  }

  editCoupon(coupon: Coupon) {
    this.openCouponModal(coupon);
  }

  deleteCoupon(coupon: Coupon) {
    if (confirm(`Tem certeza que deseja excluir o cupom "${coupon.code}"?`)) {
      this.apiService.deleteCoupon(coupon.id).subscribe({
        next: () => {
          this.coupons = this.coupons.filter(c => c.id !== coupon.id);
          this.filterCoupons();
        },
        error: (error) => {
          console.error('Error deleting coupon:', error);
        }
      });
    }
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  closeModal() {
    const modal = document.getElementById('couponModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
  }
}