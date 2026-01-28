import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ServicesComponent } from './components/services/services.component';
import { HeaderComponent } from './components/header/header.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import { DateService } from '../../../../service/date.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PatternLockComponent } from '../../../shared/components/pattern-lock/pattern-lock.component';
import { TechnicalServiceService } from '../../../../service/technical-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-technical-service',
  imports: [
    CommonModule,
    ServicesComponent,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PatternLockComponent,
  ],
  templateUrl: './technical-service.component.html',
  styleUrl: './technical-service.component.scss',
})
export class TechnicalServiceComponent {
  @ViewChild(ServicesComponent) servicesComponent!: ServicesComponent;

  public authService = inject(AuthService);
  private readonly technicalServiceService = inject(TechnicalServiceService);
  private readonly dateService = inject(DateService);

  private readonly formBuilder = inject(FormBuilder);

  public openModal: boolean = false;
  public loading: boolean = false;
  public settingForm: FormGroup = this.formBuilder.group({});

  public password: any[] = [
    { name: 'código', code: 1 },
    { name: 'patrón', code: 2 },
    { name: 'sin contraseña', code: 3 },
  ];

  public serviceForm: FormGroup = this.formBuilder.group({
    ser_description: ['', [Validators.required]],
    ser_name: ['', [Validators.required]],
    ser_phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    ser_price: ['', [Validators.required]],
    ser_cost_spare_part: [0],
    ser_password: [this.password[3], [Validators.required]],
    ser_password_code: [''],
    ser_pattern: [''],
    ser_status: [true],
    ser_paid: [false],
    ser_id: [''],
    ser_start_date: [''],
    ser_update_date: [''],
    ser_maximum_withdrawal_date: [''],
    ser_team_state: [true],
    is_active: [true, Validators.required],
    created_by: [''],
    created_at: [''],
    updated_by: [''],
    updated_at: [''],
  });

  ngOnInit() {}

  emitModal(event: boolean) {
    this.openModal = event;
  }

  onClose() {
    this.openModal = false;
    this.serviceForm.reset({
      ser_status: true,
      ser_team_state: this.serviceForm.value.ser_team_state,
    });
  }

  async onSubmit() {
    this.loading = true;
    try {
      if (!this.serviceForm.value) {
        this.serviceForm.markAllAsTouched();
        this.loading = false;
        return;
      }

      if (this.serviceForm.value.ser_id) {
        this.serviceForm
          .get('ser_update_date')
          ?.setValue(this.dateService.getDate());

        this.technicalServiceService
          .updateService(this.serviceForm.value.ser_id, this.serviceForm.value)
          .then((res) => {
            Swal.fire({
              title: '¿Desea imprimir Recibo?',
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: 'Si',
              denyButtonText: `No`,
            }).then((result) => {
              if (result.isConfirmed) {
                this.print(this.serviceForm.value);
                this.finishSave();
                this.serviceForm.reset({
                  ser_status: true,
                  ser_team_state: this.serviceForm.value.ser_team_state,
                });
              }
              this.finishSave();
              this.serviceForm.reset({
                ser_status: true,
                ser_team_state: this.serviceForm.value.ser_team_state,
              });
            });
          });
      } else {
        this.serviceForm
          .get('ser_start_date')
          ?.setValue(this.dateService.getDate());
        const startDate = this.serviceForm.get('ser_start_date')?.value;
        const dateObj = new Date(startDate);
        dateObj.setMonth(dateObj.getMonth() + 3);
        const maxDate = dateObj.toISOString().slice(0, 10);
        this.serviceForm.get('ser_maximum_withdrawal_date')?.setValue(maxDate);

        this.technicalServiceService
          .addService(this.serviceForm.value)
          .then((res) => {
              Swal.fire({
              title: '¿Desea imprimir Recibo?',
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: 'Si',
              denyButtonText: `No`,
            }).then((result) => {
              if (result.isConfirmed) {
                this.print(this.serviceForm.value);
                this.finishSave();
                this.serviceForm.reset({
                  ser_status: true,
                  ser_team_state: true,
                });
              }
              this.finishSave();
              this.serviceForm.reset({
                ser_status: true,
                ser_team_state: true,
              });
            });
          });
      }
    } catch (err) {
      this.loading = false;
    }
  }

  finishSave() {
    this.openModal = false;
    this.loading = false;
  }

  onPattern(arr: number[]) {
    this.serviceForm.get('ser_pattern')?.setValue(arr.join('-'));
  }

  service(data: any) {
    this.openModal = true;

    this.serviceForm.patchValue(data);
  }

  toggle(data: any) {
    this.serviceForm.patchValue(data.ser);

    this.technicalServiceService
      .updateService(this.serviceForm.value.ser_id, this.serviceForm.value)
      .then((res) => {
        this.serviceForm.reset({
          ser_status: false,
          ser_team_state: false,
        });
        this.servicesComponent.changeTab(data.state);
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

        // Draw pattern line + inicio (0)
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

        // Marcador de fin (1)
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

    // Selección de contraseña
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

    // Ventana de impresión
    const printContent = `
    <html>
      <head>
        <title>Impresión de Servicio</title>
       <style>
          @media print {
            @page { 
              margin: 0;
              size: 58mm auto; 
            }
        
            body { 
              margin: 0;
              padding: 10px;
              width: 58mm !important
            }
          }
        
          body { 
            font-family: Arial; 
            padding: 10px;
            width: 58mm !important
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
            width: 130px; 
            height: 130px; 
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
          <div class="item"><span class="label">Fecha ingreso:</span> ${ser.created_at
            .toDate()
            .toLocaleDateString('es-EC')}</div>
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
              ${ser.ser_paid ? 'Pagado' : 'Pendiente'}
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
          <div class="item"><span class="label">Fecha ingreso:</span> ${ser.created_at
            .toDate()
            .toLocaleDateString('es-EC')}</div>
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
