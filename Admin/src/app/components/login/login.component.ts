import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  loading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.credentials.email && this.credentials.password) {
      this.loading = true;
      this.errorMessage = '';
      
      this.apiService.login(this.credentials.email, this.credentials.password)
        .subscribe({
          next: (response) => {
            this.authService.login(response.token);
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'Email ou senha inválidos.';
            console.error('Login error:', error);
          }
        });
    }
  }
}


