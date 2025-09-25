import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-employees',
  imports: [CommonModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {
  fecha = '23 sep';
  promedio = '$825';

  ventas: any[] = [
    { empleado: 'Empleado 1', totalVentas: '$3,000', productosVendidos: 30 },
    { empleado: 'Empleado 2', totalVentas: '$2,500', productosVendidos: 25 },
    { empleado: 'Empleado 3', totalVentas: '$1,800', productosVendidos: 18 },
    { empleado: 'Empleado 4', totalVentas: '$2,200', productosVendidos: 22 },
  ];
}
