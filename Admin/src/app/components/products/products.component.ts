import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product, ProductFormData } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  editingProduct: Product | null = null;
  productFormData: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    collection: '',
    attributes: {},
    images: [],
    isActive: true,
    priority: 1
  };
  
  saving = false;
  loading = false;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.extractCategories();
        this.filterProducts();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  extractCategories() {
    const uniqueCategories = [...new Set(this.products.map(p => p.category))];
    this.categories = uniqueCategories.sort();
  }

  filterProducts() {
    let filtered = [...this.products];

    // Filtrar por termo de busca
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por categoria
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Filtrar por status do estoque
    if (this.selectedStatus) {
      switch (this.selectedStatus) {
        case 'in_stock':
          filtered = filtered.filter(p => p.stock > 10);
          break;
        case 'low_stock':
          filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
          break;
        case 'out_of_stock':
          filtered = filtered.filter(p => p.stock === 0);
          break;
      }
    }

    this.filteredProducts = filtered;
    this.calculatePagination();
    this.cdr.markForCheck();
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
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
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.filterProducts();
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return this.getPlaceholderImage();
  }

  getPlaceholderImage(): string {
    // SVG placeholder inline para evitar dependência externa
    const svg = `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="50" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      <text x="25" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6c757d">No Image</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  onImageError(event: any) {
    event.target.src = this.getPlaceholderImage();
  }

  getStockClass(stock: number): string {
    if (stock > 10) return 'stock-high';
    if (stock > 0) return 'stock-medium';
    return 'stock-low';
  }

  getProductStatus(product: Product): string {
    if (product.stock > 10) return 'Em estoque';
    if (product.stock > 0) return 'Estoque baixo';
    return 'Sem estoque';
  }

  getProductStatusClass(product: Product): string {
    if (product.stock > 10) return 'badge-in-stock';
    if (product.stock > 0) return 'badge-low-stock';
    return 'badge-out-of-stock';
  }

  openProductModal(product?: Product) {
    this.editingProduct = product || null;
    
    if (product) {
      this.productFormData = {
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        collection: product.collection || '',
        attributes: product.attributes || {},
        images: product.images || [],
        isActive: product.isActive ?? true,
        priority: product.priority || 1
      };
    } else {
      this.productFormData = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        collection: '',
        attributes: {},
        images: [],
        isActive: true,
        priority: 1
      };
    }

    // Abrir modal (assumindo que você tem Bootstrap)
    const modal = document.getElementById('productModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  saveProduct() {
    if (this.editingProduct) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct() {
    this.saving = true;
    this.apiService.createProduct(this.productFormData).subscribe({
      next: (product) => {
        this.products.unshift(product);
        this.filterProducts();
        this.closeModal();
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateProduct() {
    if (!this.editingProduct) return;
    
    this.saving = true;
    this.apiService.updateProduct(this.editingProduct.id, this.productFormData).subscribe({
      next: (product) => {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = product;
          this.filterProducts();
        }
        this.closeModal();
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  editProduct(product: Product) {
    this.openProductModal(product);
  }

  deleteProduct(product: Product) {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.filterProducts();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.cdr.markForCheck();
        }
      });
    }
  }

  closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
  }
}