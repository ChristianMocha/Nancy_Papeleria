import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.getUser().pipe(
      map(user => {
        if (user) {
          // Si ya está logueado, redirige al dashboard
          this.router.navigate(['/']);
          return false;
        } else {
          // Si no está logueado, permite acceder al login
          return true;
        }
      })
    );
  }
}
