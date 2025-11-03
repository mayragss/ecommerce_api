import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container-fluid">
        <button class="btn btn-link d-md-none me-2" (click)="toggleSidebar()" type="button" style="color: #624725;">
          <i class="fas fa-bars"></i>
        </button>
        <a class="navbar-brand fw-bold" href="#" style="color: #624725;">
          GAITHGIO
        </a>
        
        <div class="navbar-nav ms-auto">
          <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
              <i class="fas fa-user-circle me-2"></i>
              <span class="d-none d-md-inline">Admin</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Perfil</a></li>
              <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Configurações</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" (click)="logout()">
                <i class="fas fa-sign-out-alt me-2"></i>Sair
              </a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent {
  constructor(private router: Router) {}

  toggleSidebar() {
    const sidebar = document.querySelector('.d-md-none .sidebar') || document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
      sidebar.classList.toggle('show');
      if (overlay) {
        if (sidebar.classList.contains('show')) {
          overlay.classList.add('show');
        } else {
          overlay.classList.remove('show');
        }
      }
    }
  }

  logout() {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/login']);
  }
}









