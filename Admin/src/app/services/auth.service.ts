import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkAuthStatus());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {}

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

  login(token: string): void {
    localStorage.setItem('admin_token', token);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}

