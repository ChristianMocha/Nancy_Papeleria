import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { EmployeeService } from '../../../../service/employee.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly formBuilder = inject(FormBuilder);

  public router = inject(Router);

  public loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  public loading: boolean = false;

  onSubmit() {
    this.loading = true;
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .then((data) => {
          this.employeeService.getEmployeeById(data.user.uid).then((res) => {
            localStorage.setItem('currentUser', JSON.stringify(res));
            this.router.navigate(['/']);
            this.loading = false;
          });

        })
        .catch((error) => {
          console.error('Error login:', error);
          this.loading = false;
          throw error;
        });
    } else {
      this.loginForm.markAllAsTouched();
      this.loading = false;
    }
  }
}
