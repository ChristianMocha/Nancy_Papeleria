import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnicalServiceService } from '../../../../../../service/technical-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-services',
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  public service = output<any>();
  public toggle = output<any>();
  public tab = output<any>();

  private readonly technicalServiceService = inject(TechnicalServiceService);

  public lstService: any[] = [];
  public paginatedService: any[] = [];
  public filteredService: any[] = [];

  public currentPage = 1;
  public pageSize = 10;
  public totalPages = 1;

  public searchTerm: string = '';
  public activeTab: 'ingresados' | 'devueltos' = 'ingresados';
  public totalPrice: number = 0;
  public totalPriceReturn: number = 0;
  public total: number = 0;
  private serviceSubscription: any;

  ngOnInit() {
    this.changeTab('ingresados');
  }

  async getService() {
    if (this.serviceSubscription) this.serviceSubscription.unsubscribe();

    this.serviceSubscription = this.technicalServiceService
      .getServices()
      .subscribe((res) => {
        this.lstService = res;
        this.filteredService = [...this.lstService];
        this.totalPages = Math.ceil(this.lstService.length / this.pageSize);
        this.updatePage();
        this.getTotal();
        this.total = 0;

      });
  }

  async getServiceReturned() {
    if (this.serviceSubscription) this.serviceSubscription.unsubscribe();

    this.serviceSubscription = this.technicalServiceService
      .getServicesFalse()
      .subscribe((res) => {
        this.lstService = res;
        this.filteredService = [...this.lstService];
        this.totalPages = Math.ceil(this.lstService.length / this.pageSize);
        this.updatePage();
        this.getTotal();
        this.getTotalReturn();
        this.total = this.totalPrice - this.totalPriceReturn;
      });
  }

  getTotal() {
    this.totalPrice = this.lstService.reduce(
      (sum: any, item: any) => sum + (Number(item.ser_price) || 0),
      0
    );
  }

  getTotalReturn() {
    this.totalPriceReturn = this.lstService.reduce(
      (sum: any, item: any) => sum + (Number(item.ser_cost_spare_part) || 0),
      0
    );
  }

  changeTab(tab: 'ingresados' | 'devueltos') {
    this.activeTab = tab;
    this.lstService = [];

    if (tab === 'ingresados') {
      this.getService();
    } else {
      this.getServiceReturned();
    }
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedService = this.filteredService.slice(start, end);
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

  toggleStatus(ser: any) {
    if (!ser.ser_team_state) {
      this.emit(ser);
      return;
    }

    if (ser.ser_cost_spare_part <= 0) {
      
      Swal.fire({
        title: 'Precio del repuesto',
        text: 'Ingrese el costo del repuesto antes de continuar.',
        icon: 'warning',
        input: 'number', // 👈 INPUT
        inputPlaceholder: 'Ingrese el precio',
        inputAttributes: {
          min: '0',
          step: '0.01',
        },
        showCancelButton: true,
        confirmButtonColor: 'rgba(221, 198, 51, 1)',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: (precio) => {
          if (!precio) {
            Swal.showValidationMessage('Debe ingresar un precio');
          }
          return precio; // devuelve el valor
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const pricesRes = Number(result.value); // 👈 Valor ingresado
  
          ser.ser_cost_spare_part = pricesRes;
          this.emit(ser);
  
        }else{
          this.changeTab(this.activeTab);
        }
      });
    }else{
      this.emit(ser);
    }

  }

  emit(ser: any){
    ser.ser_team_state = !ser.ser_team_state;
        ser.ser_status = !ser.ser_team_state;
        const data = {
          ser: ser,
          state: this.activeTab,
        };
        this.toggle.emit(data);
  }

  filterService() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredService = [...this.lstService];
    } else {
      this.filteredService = this.lstService.filter(
        (ser) =>
          ser.name?.toLowerCase().includes(term) ||
          ser.ser_description?.toLowerCase().includes(term)
      );
    }

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredService.length / this.pageSize);

    this.updatePage();
  }

  editProduct(ser: any) {
    this.service.emit(ser);
  }
  confirmDelete(ser: any) {
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
        this.technicalServiceService.deleteService(ser.ser_id).then((res) => {
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

  print(ser: any) {
    const drawPatternScript = `
    <script>
      function drawPattern(patternString) {
        if (!patternString) return;
        const canvas = document.getElementById("patternCanvas");
        const ctx = canvas.getContext("2d");

        const points = {
          1: [0, 0], 2: [1, 0], 3: [2, 0],
          4: [0, 1], 5: [1, 1], 6: [2, 1],
          7: [0, 2], 8: [1, 2], 9: [2, 2]
        };

        const pattern = patternString.split("-").map(n => parseInt(n));

        const size = 200;
        const cell = size / 3;

        canvas.width = size;
        canvas.height = size;

        ctx.lineWidth = 5;
        ctx.strokeStyle = "#1a73e8";
        ctx.fillStyle = "#1a73e8";

        
        for (let i = 1; i <= 9; i++) {
          const [x, y] = points[i];
          ctx.beginPath();
          ctx.arc(x * cell + cell / 2, y * cell + cell / 2, 12, 0, Math.PI * 2);
          ctx.fill();
        }

        
        ctx.beginPath();
        pattern.forEach((p, index) => {
          const [x, y] = points[p];
          const px = x * cell + cell / 2;
          const py = y * cell + cell / 2;

          if (index === 0) {
            ctx.moveTo(px, py);
            ctx.beginPath();
            ctx.fillStyle = "#00b300";
            ctx.arc(px, py, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("0", px, py);

            ctx.beginPath();
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
        ctx.stroke();

        
        const [lx, ly] = points[pattern[pattern.length - 1]];
        const endX = lx * cell + cell / 2;
        const endY = ly * cell + cell / 2;

        ctx.beginPath();
        ctx.fillStyle = "#d90000";
        ctx.arc(endX, endY, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("1", endX, endY);
      }

      window.onload = function() {
        if ("${ser.ser_password}" == "2") {
          drawPattern("${ser.ser_pattern}");
        }
        window.print();
      }
    </script>
  `;

    let passwordHtml = '';
    if (ser.ser_password == 1) {
      passwordHtml = `<div class="item"><span class="label">Código:</span> ${
        ser.ser_password_code || '—'
      }</div>`;
    }
    if (ser.ser_password == 2) {
      passwordHtml = `
      <div class="item">
        <span class="label">Patrón:</span><br><br>
        <canvas id="patternCanvas" style="border-radius:10px;"></canvas>
      </div>`;
    }
    if (ser.ser_password == 3) {
      passwordHtml = `<div class="item"><span class="label">Contraseña:</span> Sin contraseña</div>`;
    }

    const printContent = `
    <html>
      <head>
        <title>Impresión de Servicio</title>
        <style>
  @media print {
    @page { 
      margin: 0;
      size: 58mm auto; /* 👈 Ajusta a 58mm si deseas más pequeño */
    }

    body { 
      margin: 0;
      padding: 10px;
      width: 58mm !important; /* 👈 Tamaño de impresora térmica */
    }
  }

  body { 
    font-family: Arial; 
    padding: 10px;
    width: 58mm !important; /* 👈 también fuera del print */
    margin: 0 auto;
  }

  h2 { 
    text-align: center; 
    margin-bottom: 20px; 
  }

  .item { 
    font-size: 13px; 
    margin-bottom: 10px; 
  }

  .label { 
    font-weight: bold; 
  }

  .card {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .page-break { 
    page-break-before: always; 
  }

  .qr-placeholder { 
    width: 100px; 
    height: 100px; 
    margin: 10px auto;
  }

  .qr-placeholder img {
    width: 100%; 
    height: 100%; 
    object-fit: contain;
  }

  .alert { 
    color: red; 
    font-weight: bold; 
    margin-top: 15px; 
    font-size: 12px;
  }
</style>

      </head>
      <body>
        <!-- Primera hoja -->
        <div class="card">
          <div class="item"><span class="label">Descripción:</span> ${
            ser.ser_description
          }</div>
          <div class="item"><span class="label">Cliente:</span> ${
            ser.ser_name
          }</div>
          <div class="item"><span class="label">Celular:</span> ${
            ser.ser_phone
          }</div>
          <div class="item"><span class="label">Precio:</span> $${
            ser.ser_price
          }</div>
          <div class="item"><span class="label">Fecha ingreso:</span> ${
           ser.created_at.toDate().toLocaleDateString('es-EC')

          }</div>
          <div class="item">
            <span 
              class="label"
              style="
                border: 1px solid #ccc;
                padding: 4px 8px;
                border-radius: 6px;
                display: inline-block;
              "
            >
              ${ser.ser_paid ? 'Pagado' : 'Pendiente de pago'}
            </span>
          </div>
          ${passwordHtml}
        </div>


        <!-- Segunda hoja -->
        <div class="page-break"></div>
        <h2>📄 Recibo</h2>
        <div class="card">
          <div class="item"><span class="label">Descripción:</span> ${
            ser.ser_description
          }</div>
          <div class="item"><span class="label">Precio:</span> $${
            ser.ser_price
          }</div>
          <div class="item"><span class="label">Cliente:</span> ${
            ser.ser_name
          }</div>
          <div class="item"><span class="label">Fecha ingreso:</span> ${
            ser.created_at.toDate().toLocaleDateString('es-EC')

          }</div>
          <hr style="margin: 15px 0;">
          <div class="item"><span class="label">Empresa:</span> CrTecnologia</div>
          <div class="item"><span class="label">Teléfono:</span> 0983922706</div>
          <div class="item"><span class="label">Dirección:</span> Av. Ricardo duran - Cuatro esquinas</div>
          <div class="item">
            <span class="label">QR:</span>
            <div class="qr-placeholder">
              <img src="./assets/whatshap/IMG_3796.JPG" alt="QR WhatsApp" />
            </div>
          </div>
          <div class="alert">
            Fecha límite para retiro del dispositivo: ${
              ser.ser_maximum_withdrawal_date || 'No definida'
            }.<br>
            Pasada esta fecha, el equipo quedará inactivo según la política de la empresa.
          </div>
        </div>

        ${drawPatternScript}
      </body>
    </html>
  `;

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  }
}
