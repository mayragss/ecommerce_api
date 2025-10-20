import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar - Only show when logged in -->
        <div class="col-md-3 col-lg-2 px-0" *ngIf="isLoggedIn$ | async">
          <app-sidebar></app-sidebar>
        </div>
        
        <!-- Main Content -->
        <div [class]="(isLoggedIn$ | async) ? 'col-md-9 col-lg-10' : 'col-12'">
          <app-navbar *ngIf="isLoggedIn$ | async"></app-navbar>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Admin Panel - E-commerce';
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    // Initialize auth state
    this.authService.isLoggedIn();
  }
}

