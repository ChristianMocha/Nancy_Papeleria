import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SuppliersService } from '../../../../../../service/suppliers.service';
import { Supplier } from '../../../../../shared/models/supplier';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-content',
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  private readonly suppliersService = inject(SuppliersService);
  public supplierEmit = output<Supplier>();

  public totalClientes = 0;
  public totalPorCobrar = 0;

  public currentPage = 1;
  public pageSize = 10;
  public totalPages = 1;

  public searchTerm: string = '';

  public suppliers: Supplier[] = [];
  public filteredSupplier: Supplier[] = [];
  public paginatedSuppliers: Supplier[] = [];

  ngOnInit() {
    this.getSuppliers();
  }

  constructor() {
    this.calcularResumen();
  }

  calcularResumen() {
    this.totalClientes = this.suppliers.length;
    this.totalPorCobrar = this.suppliers.reduce(
      (acc, c) => acc + c.supp_total_to_pay,
      0
    );
  }

  getSuppliers() {
    this.suppliersService.getSuppliers().subscribe((suppliers) => {
      this.suppliers = suppliers;
      this.filteredSupplier = [...this.suppliers];
      this.totalPages = Math.ceil(this.suppliers.length / this.pageSize);
      this.calcularResumen();
      this.updatePage();
    });
  }

  toggleStatus(item: Supplier) {
    const newState = !item.is_active;

    this.suppliersService
      .updateSupplier(item.supp_id, { is_active: newState })
      .then(() => {
        item.is_active = newState; 
      })
      .catch((err) => console.error(err));
  }

  editProduct(data: Supplier) {
    this.supplierEmit.emit(data);
  }

  confirmDelete(data: Supplier) {
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
        this.suppliersService.deleteService(data.supp_id).then((res) => {
          console.log(res);
          Swal.fire(
            'Eliminado',
            'El registro fue eliminado correctamente.',
            'success'
          );
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelado', 'El registro sigue intacto.', 'info');
      }
    });
  }

  filterEmployees() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredSupplier = [...this.suppliers];
    } else {
      this.filteredSupplier = this.suppliers.filter(
        (emp) =>
          emp.supp_full_name?.toLowerCase().includes(term) ||
          emp.supp_identification_document?.toLowerCase().includes(term)
      );
    }

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredSupplier.length / this.pageSize);
    console.log(
      'Filtrados:',
      this.filteredSupplier.length,
      'Total:',
      this.suppliers.length
    );

    this.updatePage();
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedSuppliers = this.filteredSupplier.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePage();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePage();
  }
}
