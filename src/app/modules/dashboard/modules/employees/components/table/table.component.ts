import { Component, inject } from '@angular/core';
import { EmployeeService } from '../../../../../../service/employee.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../../service/auth.service';

@Component({
  selector: 'app-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  private readonly employeeService = inject(EmployeeService);
  public authService = inject(AuthService);

  public lstEmployees: any[] = [];
  public paginatedEmployees: any[] = [];
  public filteredEmployees: any[] = [];

  public currentPage = 1;
  public pageSize = 10;
  public totalPages = 1;

  public searchTerm: string = '';

  ngOnInit() {
    this.getEmployees();
  }

  async getEmployees() {
    this.employeeService.getEmployees().subscribe((res) => {
      this.lstEmployees = res;
      this.filteredEmployees = [...this.lstEmployees];
      this.totalPages = Math.ceil(this.lstEmployees.length / this.pageSize);
      this.updatePage();
    });
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(start, end);
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

  toggleStatus(item: any) {
    const newState = !item.is_active;

    this.employeeService
      .updateEmployee(item.emp_id, { is_active: newState })
      .then(() => {
        item.is_active = newState;
      })
      .catch((err) => console.error(err));
  }

  filterEmployees() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredEmployees = [...this.lstEmployees];
    } else {
      this.filteredEmployees = this.lstEmployees.filter(
        (emp) =>
          emp.emp_name?.toLowerCase().includes(term) ||
          emp.emp_email?.toLowerCase().includes(term),
      );
    }

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);

    this.updatePage();
  }
}
