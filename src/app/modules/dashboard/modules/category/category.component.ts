import { Component, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { CategoryService } from '../../../../service/category.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../service/auth.service';
import { ContentComponent } from './components/content/content.component';

@Component({
  selector: 'app-category',
  imports: [
    HeaderComponent,
    CommonModule,
    FormsModule,
    LoadingComponent,
    ContentComponent,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  @ViewChild(ContentComponent) contentComponent!: ContentComponent;
  public authService = inject(AuthService);
  private readonly categoryService = inject(CategoryService);
  public showModal: boolean = false;
  public loading: boolean = false;
  public categoryName: string = '';
  public cat_id: any;

  ngOnInit() {
  }

  showModalCategories() {
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
      if (this.cat_id) {
        await this.categoryService.updateCategory(this.cat_id, {
          cat_name: this.categoryName,
        });
      } else {
        await this.categoryService.addCategory({
          cat_name: this.categoryName,
          is_active: true,
        });
      }
      this.loading = false;
      this.showModal = false;
      this.contentComponent.getCategories();
      this.resetModal();
    } catch (err) {
      this.loading = false;
      this.showModal = false;
      console.error('❌ error:', err);
    }
  }

  resetModal() {
    this.showModal = false;
    this.categoryName = '';
    this.cat_id = null;
  }

  onClose() {
    this.showModal = false;
    this.resetModal();
  }

  category(data: any) {
    this.cat_id = data.cat_id;
    this.categoryName = data.cat_name;
    this.showModal = true;
  }
}
