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

  private readonly technicalServiceService = inject(TechnicalServiceService);

  public lstService: any[] = [];
  public paginatedService: any[] = [];
  public filteredService: any[] = [];

  public currentPage = 1;
  public pageSize = 10;
  public totalPages = 1;

  public searchTerm: string = '';

  ngOnInit() {
    this.getService();
  }

  async getService() {
    console.log('entrano el metodo de traer serleados');
    this.technicalServiceService.getServices().subscribe((res) => {
      console.log(res);
      this.lstService = res;
      this.filteredService = [...this.lstService];
      this.totalPages = Math.ceil(this.lstService.length / this.pageSize);
      this.updatePage();
    });
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
    console.log(ser);
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
    console.log(
      'Filtrados:',
      this.filteredService.length,
      'Total:',
      this.lstService.length
    );

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

        // Draw dots
        for (let i = 1; i <= 9; i++) {
          const [x, y] = points[i];
          ctx.beginPath();
          ctx.arc(x * cell + cell / 2, y * cell + cell / 2, 12, 0, Math.PI * 2);
          ctx.fill();
        }

        // ---------- DIBUJAR LÍNEA DEL PATRÓN + INICIO (0) ----------
        ctx.beginPath();
        pattern.forEach((p, index) => {
          const [x, y] = points[p];
          const px = x * cell + cell / 2;
          const py = y * cell + cell / 2;

          if (index === 0) {
            ctx.moveTo(px, py);

            // 🟢 Marcador de inicio (0)
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

        // 🔴 Marcador de fin (1)
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

  // -------- SELECTOR DE LO QUE SE VA A MOSTRAR EN CONTRASEÑA ---------
  let passwordHtml = "";

  if (ser.ser_password == 1) {
    passwordHtml = `
      <div class="item">
        <span class="label">Código:</span> ${ser.ser_password_code || "—"}
      </div>`;
  }

  if (ser.ser_password == 2) {
    passwordHtml = `
      <div class="item">
        <span class="label">Patrón:</span>
        <br><br>
        <canvas id="patternCanvas" style="border:1px solid #ccc; border-radius:10px;"></canvas>
      </div>`;
  }

  if (ser.ser_password == 3) {
    passwordHtml = `
      <div class="item">
        <span class="label">Contraseña:</span> Sin contraseña
      </div>`;
  }

  // -------- VENTANA DE IMPRESIÓN CON DOS HOJAS ---------
  const printContent = `
    <html>
      <head>
        <title>Impresión de Servicio</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { text-align: center; margin-bottom: 20px; }
          .item { font-size: 16px; margin-bottom: 12px; }
          .label { font-weight: bold; }
          .card {
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 40px;
          }
          .page-break { page-break-before: always; }
          .qr-placeholder {
            width: 150px;
            height: 150px;
            border: 1px dashed #999;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          .alert { color: red; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <!-- PRIMERA HOJA -->
        <h2>📄 Detalle del Servicio Técnico</h2>
        <div class="card">
          <div class="item"><span class="label">Descripción:</span> ${ser.ser_description}</div>
          <div class="item"><span class="label">Cliente:</span> ${ser.ser_name}</div>
          <div class="item"><span class="label">Celular:</span> ${ser.ser_phone}</div>
          <div class="item"><span class="label">Precio:</span> $${ser.ser_price}</div>
          <div class="item"><span class="label">Fecha ingreso:</span> ${ser.ser_start_date}</div>
          ${passwordHtml}
        </div>

        <!-- SEGUNDA HOJA -->
        <div class="page-break"></div>
        <h2>📄 Información de Contacto</h2>
        <div class="card">
          <div class="item"><span class="label">Descripción:</span> ${ser.ser_description}</div>
          <div class="item"><span class="label">Precio:</span> $${ser.ser_price}</div>
          <div class="item"><span class="label">Cliente:</span> ${ser.ser_name}</div>
          <div class="item"><span class="label">Fecha ingreso:</span> ${ser.ser_start_date}</div>
          <hr style="margin: 15px 0;">
          <div class="item"><span class="label">Empresa:</span> CrTecnologia</div>
          <div class="item"><span class="label">Teléfono:</span> 0983922706</div>
          <div class="item"><span class="label">Dirección:</span> Av. Ricardo duran - Cuatro esquinas</div>
          <div class="item">
            <span class="label">QR:</span>
            <div class="qr-placeholder">Aquí va el QR</div>
          </div>
          <div class="alert">
            Máximo retiro del celular: ${ser.ser_maximum_withdrawal_date || "No definido"}<br>
            En caso contrario, el celular será dado de baja.
          </div>
        </div>

        ${drawPatternScript}
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
}




}
