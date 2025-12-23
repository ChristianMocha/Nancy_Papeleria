import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public router = inject(Router);
  public open = false;

  goToPage(route: string) {
    this.router.navigate([route]);
  }

  openDrawer() {
    this.open = !this.open;
  }
}
