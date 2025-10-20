import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('admin_token');
    
    if (token) {
      // Verificar se o token não expirou (opcional)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp > currentTime) {
          return true;
        } else {
          localStorage.removeItem('admin_token');
          this.router.navigate(['/login']);
          return false;
        }
      } catch (error) {
        localStorage.removeItem('admin_token');
        this.router.navigate(['/login']);
        return false;
      }
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}




