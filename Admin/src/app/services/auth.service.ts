import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkAuthStatus());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private tokenCheckInterval: any;

  constructor() {
    this.startTokenCheck();
  }

  private checkAuthStatus(): boolean {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp > currentTime) {
        return true;
      } else {
        localStorage.removeItem('admin_token');
        return false;
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      return false;
    }
  }

  private startTokenCheck(): void {
    // Verificar token a cada 30 segundos
    this.tokenCheckInterval = setInterval(() => {
      if (this.isLoggedInSubject.value) {
        const isValid = this.checkAuthStatus();
        if (!isValid) {
          this.logout();
        }
      }
    }, 30000);
  }

  private stopTokenCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }

  login(token: string): void {
    localStorage.setItem('admin_token', token);
    this.isLoggedInSubject.next(true);
    this.startTokenCheck();
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    this.isLoggedInSubject.next(false);
    this.stopTokenCheck();
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}

