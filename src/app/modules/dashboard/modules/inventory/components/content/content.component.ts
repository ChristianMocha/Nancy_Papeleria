import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../../../../service/product.service';
import { Category } from '../../../../../shared/models/category';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../../../shared/pipe/search.pipe';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../service/auth.service';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { SuppliersService } from '../../../../../../service/suppliers.service';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule, SearchPipe, LoadingComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  private readonly categoryService = inject(CategoryService);
  public readonly authService = inject(AuthService);
  public readonly productService = inject(ProductService);
  public readonly suppliersService = inject(SuppliersService);
  public router = inject(Router);

  public lstCategories: Category[] = [];
  public lstProducts: any[] = [];
  public lstSuppliers: any[] = [];

  public searchTerm: string = '';
  public categoryName: string = '';

  public totalInventoryCost: number = 0;
  public totalInventoryCostClient: number = 0;
  public currentPage: number = 1;
  public itemsPerPage: number = 4;
  public totalCliente = 0;
  public totalProveedor = 0;

  public paginatedProducts: any[] = [];
  public filteredList: any[] = [];

  public selectedImage: string | null = null;
  public showModal: boolean = false;
  public loading: boolean = false;

  public selectedCategory: any;
  public showButtonMore: boolean = false;
  public products: any;

  ngOnInit() {
    this.getAllCategories();
    this.getAllPorducts();
    this.getSuppliers();
    // this.getAllProductsCostTotal();
    // this.getAllProductsCostTotalClient();
    this.getCategories();
  }

  async getAllCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {},
      error: (err) => console.error('❌ Error:', err),
    });
  }

  async getAllPorducts() {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        this.lstProducts = res;
        this.lstProducts = res.map((prod) => ({
          ...prod,
          prod_start_date: prod.prod_start_date?.toDate
            ? prod.prod_start_date.toDate()
            : prod.prod_start_date,
        }));

        this.filteredList = [...this.lstProducts];

        this.updatePaginatedProducts();
        this.calculateCustomer();
      },
      error: (err) => console.error('❌ Error:', err),
    });
  }
  async getAllProductsCostTotal() {
    this.productService
      .getAllProductsCostTotal()
      .then((res) => {
        this.totalInventoryCost = res;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async getAllProductsCostTotalClient() {
    this.productService
      .getAllProductsCostTotalClient()
      .then((res) => {
        this.totalInventoryCostClient = res;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async onCategoryChange(event: any) {
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
    if (!selectedCategoryId) return this.getAllPorducts();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  // 🔹 Filtro de productos según el término de búsqueda
  get filteredProducts(): any[] {
    if (!this.searchTerm) return this.filteredList;
    const term = this.searchTerm.toLowerCase();
    return this.filteredList.filter(
      (p) =>
        p.prod_name.toLowerCase().includes(term) ||
        p.prod_code.toLowerCase().includes(term),
    );
  }

  // 🔹 Actualiza los productos visibles según la página actual
  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  // 🔹 Controles de paginación
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  // 🔹 Detecta cambios en el buscador (puedes llamarlo desde [(ngModel)])
  onSearchChange() {
    this.currentPage = 1;
    this.updatePaginatedProducts();
    this.calculateCustomer();
  }

  editProduct(prod: any) {
    this.router.navigate([
      '/product/edit',
      prod.prod_category_id,
      prod.prod_id,
    ]);
  }

  // confirmación antes de eliminar
  confirmDelete(prod: any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteProduct(prod);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelado', 'El registro sigue intacto.', 'info');
      }
    });
  }

  deleteProduct(prod: any) {
    this.productService
      .deleteProductGlobal(prod.prod_id)
      .then((res) => {
        Swal.fire(
          'Eliminado',
          'El registro fue eliminado correctamente.',
          'success',
        );
      });
  }

  openImageModal(imageUrl: string | undefined) {
    if (!imageUrl) return;
    this.selectedImage = imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }
  onClose() {
    this.showModal = false;
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
        is_active: true,
      });
      this.loading = false;
      this.showModal = false;
    } catch (err) {
      this.loading = false;
      this.showModal = false;
      console.error('❌ error:', err);
    }
  }

  goToPage(route: string) {
    this.router.navigate([route]);
  }

  async getCategories() {
    try {
      this.lstCategories = await firstValueFrom(
        this.categoryService.getCategories(),
      );
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }

  async selectCategory(event: any) {
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
    if (!selectedCategoryId) return this.getAllPorducts();

    if (selectedCategoryId === 'all') {
      this.filteredList = [...this.lstProducts];
    } else {
      this.filteredList = this.lstProducts.filter(
        (p) => p.prod_category_id === selectedCategoryId,
      );
    }

    this.currentPage = 1; // reset página
    this.updatePaginatedProducts(); // repaginar
    this.calculateCustomer();
  }

  calculateCustomer() {
    const list = this.filteredProducts ?? [];

    this.totalCliente = list.reduce((sum, p) => {
      const price = Number(p.prod_sale_price) || 0;
      const qty = Number(p.prod_quantity_available) || 0;
      return sum + price * qty;
    }, 0);

    this.totalProveedor = list.reduce((sum, p) => {
      const cost = Number(p.prod_purchase_cost) || 0;
      const qty = Number(p.prod_quantity_available) || 0;
      return sum + cost * qty;
    }, 0);

  }

  goToSell() {
    this.router.navigate(['sell']);
  }

  async getSuppliers() {
    try {
      this.lstSuppliers = await firstValueFrom(
        this.suppliersService.getSuppliers(),
      );
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }

  async selectSupplier(event: any) {
    const selectedSupplierId = (event.target as HTMLSelectElement).value;
    if (!selectedSupplierId) return this.getAllPorducts();

    if (selectedSupplierId === 'all') {
      this.filteredList = [...this.lstProducts];
    } else {
      this.filteredList = this.lstProducts.filter(
        (p) => p.prod_supplier_id === selectedSupplierId,
      );
    }

    this.currentPage = 1; 
    this.updatePaginatedProducts();
    this.calculateCustomer();
  }
}
