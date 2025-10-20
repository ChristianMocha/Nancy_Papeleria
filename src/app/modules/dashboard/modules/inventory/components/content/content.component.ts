import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../../../../service/product.service';
import { Category } from '../../../../../shared/models/category';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../../../shared/pipe/search.pipe';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule, SearchPipe],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

  private readonly categoryService = inject(CategoryService);
  public readonly productService = inject(ProductService);

  public lstCategories: Category[] = [];
  public lstProducts: any[] = [];
  public totalInventoryCost: number = 0

  public searchTerm: string = '';
  public currentPage: number = 1;
  public itemsPerPage: number = 7;
  public paginatedProducts: any[] = [];
  public selectedImage: string | null = null;



  ngOnInit() {
    this.getAllCategories();
    this.getAllPorducts();
    this.getAllProductsCostTotal();

  }
  


  async getAllCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        console.log(this.lstCategories = res);
        console.log('✅ Categorías:', res)
      },
      error: (err) => console.error('❌ Error:', err),
    });
  }

  async getAllPorducts() {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        console.log('✅ Productos:', res)
        this.lstProducts = res
        this.lstProducts = res.map(prod => ({
          ...prod,
          prod_start_date: prod.prod_start_date?.toDate ? prod.prod_start_date.toDate() : prod.prod_start_date
        }));
        console.log(this.lstProducts);
          this.updatePaginatedProducts();
      },
      error: (err) => console.error('❌ Error:', err),
    });
  }
  async getAllProductsCostTotal() {

    
    this.productService.getAllProductsCostTotal().then((res) => {
      console.log(res);
      this.totalInventoryCost = res
      
    }).catch((err) => {
      console.error(err);
      
    });
  }

  async onCategoryChange(event: any){
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
      console.log('Categoría seleccionada:', selectedCategoryId);
      if (!selectedCategoryId) return this.getAllPorducts();

    this.productService.getProductsByCategory(selectedCategoryId)

    try {
      this.lstProducts = await firstValueFrom(this.productService.getProductsByCategory(selectedCategoryId));
      console.log('productos:', this.lstProducts);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }
  
  // 🔹 Filtro de productos según el término de búsqueda
  get filteredProducts(): any[] {
    if (!this.searchTerm) return this.lstProducts;
    const term = this.searchTerm.toLowerCase();
    return this.lstProducts.filter(p =>
      p.prod_name.toLowerCase().includes(term)
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
  }

  editProduct(prod: any) {
    console.log('Editar', prod);
    // abrir modal o navegar a formulario de edición
    // this.router.navigate(['/productos', prod.id, 'edit']);
  }

  // confirmación antes de eliminar
  confirmDelete(prod: any) {
    const ok = confirm(`¿Eliminar ${prod.prod_name}?`);
    if (ok) this.deleteProduct(prod);
  }
  
  deleteProduct(prod: any) {
    console.log('Eliminar', prod);
    // llamar al servicio para eliminar y luego actualizar lista/paginación
    // this.productService.deleteProduct(prod.id).then(() => this.getAllPorducts());
  }

  openImageModal(imageUrl: string | undefined) {
  if (!imageUrl) return;
    this.selectedImage = imageUrl;
  }
  
  closeImageModal() {
    this.selectedImage = null;
  }

  

}
