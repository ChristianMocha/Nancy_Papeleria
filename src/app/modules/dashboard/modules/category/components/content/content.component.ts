import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import Swal from 'sweetalert2';
import { CategoryService } from '../../../../../../service/category.service';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  private readonly categoryService = inject(CategoryService);
  public category = output<any>();

  public loading = false;

  // 🔹 Data
  public lstCategories: any[] = [];
  public paginatedCategories: any[] = [];
  public searchTerm = '';
  public filteredCategories: any[] = [];

  // 🔹 Paginación
  public currentPage = 1;
  public itemsPerPage = 10;

  ngOnInit() {
    this.getCategories();
  }

  async getCategories() {
    this.loading = true;

    try {
      this.lstCategories = await firstValueFrom(
        this.categoryService.getCategories(),
      );

      this.filteredCategories = [...this.lstCategories];
      this.currentPage = 1;
      this.updatePaginatedCategories();
    } catch (err) {
      console.error('❌ error:', err);
    } finally {
      this.loading = false;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories.length / this.itemsPerPage);
  }

  updatePaginatedCategories() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCategories = this.filteredCategories.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedCategories();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedCategories();
    }
  }

  editCategory(cat: any) {
    this.category.emit(cat);
  }

  confirmDelete(cat: any) {
    if (cat.productCount > 0) {
      
      Swal.fire(
            'Error',
            'No puede eliminar esta categoría porque tiene productos asociados.',
            'error',
          );
      return;
    }
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Categoría: ${cat.cat_name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(cat.cat_id).then((res) => {
          Swal.fire(
            'Eliminado',
            'El registro fue eliminado correctamente.',
            'success',
          );
        });
        this.getCategories();
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredCategories = this.lstCategories.filter((cat) =>
      cat.cat_name.toLowerCase().includes(term),
    );

    this.currentPage = 1;
    this.updatePaginatedCategories();
  }
}
