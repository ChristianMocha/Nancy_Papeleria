import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../service/auth.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, LoadingComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  public router = inject(Router);
  public currentPage: string = '';

  public modal: boolean = false;
  public loading: boolean = false;
  public user: any;

  ngOnInit() {
    this.user = this.authService.getUserLocalStorage();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPage = event.urlAfterRedirects.replace('/', '');
      });
  }

  goToPage(path: string) {
    this.router.navigate([path]);
    this.currentPage = path;
  }

  showModal() {
    this.modal = !this.modal;
  }

  onConfirm() {
    this.loading = true;
    this.authService.logout();
    this.router.navigate(['/login']);
    window.location.reload();
    localStorage.clear();
  }
  get showNavbar(): boolean {
    return !this.router.url.includes('/sell');
  }
}
