import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {

  public emitModal = output<any>();
  public router = inject(Router);

  showModalCategories(){
    this.emitModal.emit(true);
  }

  addProduct(){
    this.router.navigate(['/product/add']);
  }

}
