import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { firstValueFrom } from 'rxjs';
import { Category } from '../../../../../shared/models/category';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../../../service/product.service';
import { toast } from 'ngx-sonner';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { UploadService } from '../../../../../../service/upload.service';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SuppliersService } from '../../../../../../service/suppliers.service';
import { Supplier } from '../../../../../shared/models/supplier';
import { AuthService } from '../../../../../../service/auth.service';
import { AlertService } from '../../../../../../service/alert.service';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    LoadingComponent,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  private readonly fb = inject(FormBuilder);
  public formProd: FormGroup = this.fb.group({});
  public readonly suppliersService = inject(SuppliersService);
  public readonly categoryService = inject(CategoryService);
  public readonly productService = inject(ProductService);
  public readonly uploadService = inject(UploadService);
  public readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  public router = inject(Router);

  public imgPoduct: string = '';
  public loading: boolean = false;
  public idProduct!: string;
  public idCategory!: string;

  public files: File[] = [];
  public categories: Category[] = [];
  public suppliers: Supplier[] = [];

  ngOnInit() {
    this.formProd = this.fb.group({
      prod_code: ['', Validators.required],
      prod_name: ['', Validators.required],
      prod_quantity_available: ['', Validators.required],
      prod_sale_price: ['', Validators.required],
      prod_purchase_cost: ['', Validators.required],
      prod_category_id: ['', Validators.required],
      prod_supplier_id: ['', Validators.required],
      prod_description: [''],
      prod_image: [''],
      prod_sold_pount: [0],

      is_active: [true, Validators.required],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
    });
    this.idCategory = this.route.snapshot.paramMap.get('idCategory')!;
    this.idProduct = this.route.snapshot.paramMap.get('idProduct')!;

    this.getCategories();
    this.getSuppliers();
    if (this.idCategory && this.idProduct) {
      this.getProductById();
    }
  }

  async getCategories() {
    try {
      // 👇 Espera al primer valor del observable
      this.categories = await firstValueFrom(
        this.categoryService.getCategories(),
      );
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }

  async getSuppliers() {
    try {
      // 👇 Espera al primer valor del observable
      this.suppliers = await firstValueFrom(
        this.suppliersService.getSuppliersActive(),
      );
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  }

  async onSubmit() {
    this.loading = true;
    if (!this.formProd.valid) {
      this.formProd.markAllAsTouched();
      this.alertService.showAlert('Los campos son obligatorios', 'error');
      this.loading = false;
      return;
    }

    if (this.idCategory && this.idProduct) {
      try {
        const data = await this.productService.updateProduct(
          this.idCategory,
          this.idProduct,
          this.formProd.value,
        );
        this.formProd.reset({
          is_active: this.formProd.value.is_active,
        });
        this.loading = false;

        this.alertService.showAlert('Producto editado', 'success');
      } catch (error) {
        this.loading = false;
        toast.error('Error al editar producto');
        console.error('Error al cargar empleados:', error);
      }
    } else {
      await this.uploadService
        .uploadImage(this.files[0])
        .then(async (result: any) => {
          this.imgPoduct = result;
          if (!this.imgPoduct) {
            this.loading = false;
            toast.error('Error al subir imagen');
            this.alertService.showAlert('Error al subir imagen', 'error');

            return;
          }

          try {
            this.formProd.value.prod_image = this.imgPoduct;

            const data = await this.productService.addProductToCategory(
              this.formProd.value.prod_category_id,
              this.formProd.value,
            );
            this.loading = false;

            this.alertService.showAlert('Producto creado', 'success');
            this.formProd.reset({
              is_active: true,
            });
            this.files = [];
          } catch (error) {
            this.loading = false;
            this.alertService.showAlert('Error al crear producto', 'error');
            console.error('Error al cargar empleados:', error);
          }
        })
        .catch((err) => {
          this.loading = false;
          this.alertService.showAlert(
            `Error al cargar empleados ${err}`,
            'error',
          );
        });
    }
  }

  async onSelect(event: any) {
    const file = event.addedFiles[0];

    const compressed = await this.compressImage(file, 0.6); // 60% calidad
    this.files.push(compressed);
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  getProductById() {
    if (!this.idProduct || !this.idCategory) return;

    this.productService
      .getProductById(this.idCategory, this.idProduct)
      .subscribe({
        next: (res) => {
          this.formProd.patchValue(res);
        },
        error: (err) => console.error('❌ Error:', err),
      });
  }

  compressImage(file: File, quality: number = 0.7): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Mantener dimensiones originales
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality, // valor entre 0 y 1 (0 = más compresión)
        );
      };
    });
  }
}
