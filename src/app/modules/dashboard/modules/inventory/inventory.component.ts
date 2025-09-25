import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { ContentComponent } from './components/content/content.component';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../../../service/category.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, NavBarComponent, ContentComponent, FormsModule, LoadingComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {

  public showModal: boolean = false;
  public loading: boolean = false;
  public categoryName: string = '';
  private readonly categoryService = inject(CategoryService);

  showModalCategories(){
    this.showModal = true;

  }


  async onSave() {
    this.loading = true;
    
    if (!this.categoryName) {
      this.loading = false;
      this.showModal = false;
      return alert('La categoría debe estar llenada');
    }

    try {
      const docRef = await this.categoryService.addCategory({
        cat_name: this.categoryName,
        cat_status: true,
        cat_start_date: new Date(),
      });
      this.loading = false;
      this.showModal = false;
      console.log('✅ primera emisión:', docRef);
    } catch (err) {
      this.loading = false;
      this.showModal = false;
      console.error('❌ error:', err);
    }

  }

  onClose() {
    this.showModal = false;
  }

  

}
