import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar">
      <div class="p-3">
        <h5 class="text-white mb-4">
          <i class="fas fa-tachometer-alt me-2"></i>
          Dashboard
        </h5>
        
        <nav class="nav flex-column">
          <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
            <i class="fas fa-chart-pie me-2"></i>
            Visão Geral
          </a>
          
          <a class="nav-link" routerLink="/users" routerLinkActive="active">
            <i class="fas fa-users me-2"></i>
            Usuários
          </a>
          
          <a class="nav-link" routerLink="/products" routerLinkActive="active">
            <i class="fas fa-box me-2"></i>
            Produtos
          </a>
          
          <a class="nav-link" routerLink="/orders" routerLinkActive="active">
            <i class="fas fa-shopping-bag me-2"></i>
            Pedidos
          </a>
          
          <a class="nav-link" routerLink="/coupons" routerLinkActive="active">
            <i class="fas fa-ticket-alt me-2"></i>
            Cupons
          </a>
        </nav>
      </div>
    </div>
  `,
  styles: []
})
export class SidebarComponent {}



