import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


@Component({
  selector: 'app-sales',
  imports: [CommonModule, NgChartsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {


public barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: { position: 'top' }
  }
};

public barChartData: ChartConfiguration<'bar'>['data'] = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  datasets: [
    {
      label: 'Semana anterior',
      data: [400, 300, 200, 500, 150, 250],
      backgroundColor: '#A7F3D0'
    },
    {
      label: 'Hoy',
      data: [450, 200, 250, 400, 100, 300],
      backgroundColor: '#059669'
    }
  ]
};

products = [
  {
    nombre: 'Tortilla de maíz',
    totalVentas: 120.50,
    vendidos: 30,
    estrella: true
  },
  {
    nombre: 'Tortilla de trigo',
    totalVentas: 85.00,
    vendidos: 20,
    estrella: false
  },
  {
    nombre: 'Tortilla de yuca',
    totalVentas: 60.25,
    vendidos: 15,
    estrella: false
  },
  {
    nombre: 'Tortilla de maduro',
    totalVentas: 95.75,
    vendidos: 18,
    estrella: true
  },
  {
    nombre: 'Tortilla de verde',
    totalVentas: 50.00,
    vendidos: 12,
    estrella: false
  }
];

}
