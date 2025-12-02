import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { map } from 'rxjs/operators';
import { AuthService } from '../../../service/auth.service';
import { EmployeeService } from '../../../service/employee.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    private readonly EmployeeService = inject(EmployeeService);

  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.getUser().pipe(
      map(user => {
        if (user) {
          console.log(user);
          return true; 
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
