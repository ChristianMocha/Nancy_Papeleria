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
import { AlertService } from '../../../../service/alert.service';

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
  private readonly alertService = inject(AlertService);

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
            console.log(res);
            localStorage.setItem('currentUser', JSON.stringify(res));
            this.router.navigate(['/']);
            this.loading = false;
          });
        })
        .catch((error) => {
          console.log('Error login:', error);
          switch (error.code) {
            case 'auth/invalid-email':
              this.alertService.showAlert('El correo no es válido.', 'error');
              break;

            case 'auth/user-not-found':
              this.alertService.showAlert(
                'Este correo no está registrado.',
                'error'
              );
              break;

            case 'auth/wrong-password':
              this.alertService.showAlert(
                'La contraseña es incorrecta.',
                'error'
              );
              break;

            case 'auth/invalid-credential':
              this.alertService.showAlert(
                'Correo o contraseña incorrectos.',
                'error'
              );
              break;

            case 'auth/too-many-requests':
              this.alertService.showAlert(
                'Demasiados intentos. Intenta más tarde.',
                'warning'
              );
              break;

            default:
              this.alertService.showAlert(
                'Ocurrió un error inesperado.',
                'error'
              );
              break;
          }
          this.loading = false;
        });
    } else {
      this.loginForm.markAllAsTouched();
      this.loading = false;
    }
  }
}
