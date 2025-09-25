import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-bills',
  imports: [CommonModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss'
})
export class BillsComponent {

  fecha = '23 sep';
  totalGastos = '$12,000';
  comparacion = 'Comparado con el martes de la semana anterior';

  gastos: any[] = [
    { tipo: 'Entradas', total: '$2,300', porcentaje: '15%', tendencia: 'up' },
    { tipo: 'Compra de productos A', total: '$3,500', porcentaje: '25%', tendencia: 'down' },
    { tipo: 'Compra de productos B', total: '$4,200', porcentaje: '35%', tendencia: 'down' },
    { tipo: 'Compra de productos C', total: '$2,000', porcentaje: '25%', tendencia: 'down' },
  ];

}
