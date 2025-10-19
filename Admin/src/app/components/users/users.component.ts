import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user.model';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  editingUser: User | null = null;
  selectedUser: User | null = null;
  userFormData: UserFormData = {
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: ''
  };
  
  saving = false;
  loading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  filterUsers() {
    let filtered = [...this.users];

    // Filtrar por termo de busca
    if (this.searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrar por função
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    // Filtrar por status (assumindo que usuários ativos são aqueles com email válido)
    if (this.selectedStatus) {
      if (this.selectedStatus === 'active') {
        filtered = filtered.filter(u => u.email && u.email.includes('@'));
      } else if (this.selectedStatus === 'inactive') {
        filtered = filtered.filter(u => !u.email || !u.email.includes('@'));
      }
    }

    this.filteredUsers = filtered;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
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
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filterUsers();
  }

  getUserInitials(user: User): string {
    return user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleClass(role: string): string {
    return role === 'admin' ? 'badge-admin' : 'badge-user';
  }

  getRoleText(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Usuário';
  }

  getStatusClass(user: User): string {
    return this.isUserActive(user) ? 'badge-active' : 'badge-inactive';
  }

  getStatusText(user: User): string {
    return this.isUserActive(user) ? 'Ativo' : 'Inativo';
  }

  isUserActive(user: User): boolean {
    return !!(user.email && user.email.includes('@'));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  openUserModal(user?: User) {
    this.editingUser = user || null;
    
    if (user) {
      this.userFormData = {
        name: user.name,
        email: user.email,
        phone: (user as any).phone || '',
        role: user.role || 'user',
        password: ''
      };
    } else {
      this.userFormData = {
        name: '',
        email: '',
        phone: '',
        role: 'user',
        password: ''
      };
    }

    // Abrir modal
    const modal = document.getElementById('userModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  viewUser(user: User) {
    this.selectedUser = user;
    
    // Abrir modal de detalhes
    const modal = document.getElementById('userDetailsModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  saveUser() {
    if (this.editingUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    this.saving = true;
    this.apiService.createUser(this.userFormData).subscribe({
      next: (user) => {
        this.users.unshift(user);
        this.filterUsers();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.saving = false;
      }
    });
  }

  updateUser() {
    if (!this.editingUser) return;
    
    this.saving = true;
    const updateData: any = { ...this.userFormData };
    if (!updateData.password) {
      updateData.password = undefined;
    }
    
    this.apiService.updateUser(this.editingUser.id, updateData).subscribe({
      next: (user) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = user;
          this.filterUsers();
        }
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.saving = false;
      }
    });
  }

  editUser(user: User) {
    this.openUserModal(user);
  }

  deleteUser(user: User) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filterUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  closeModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
  }

  getUserPhone(user: User | null | undefined): string {
    return (user as any)?.phone || 'N/A';
  }
}