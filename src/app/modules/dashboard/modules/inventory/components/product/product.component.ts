import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { firstValueFrom } from 'rxjs';
import { Category } from '../../../../../shared/models/category';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../../../service/product.service';
import { toast } from 'ngx-sonner';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { UploadService } from '../../../../../../service/upload.service';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';


@Component({
  selector: 'app-product',
  imports: [CommonModule, ReactiveFormsModule, NgxDropzoneModule, LoadingComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {

  private readonly fb = inject(FormBuilder);
  public formProd: FormGroup = this.fb.group({});
  public readonly categoryService = inject(CategoryService);
  public readonly productService = inject(ProductService);
  public readonly uploadService = inject(UploadService);

  public files: File[] = [];
  public imgPoduct: string = '';
  public loading: boolean = false;


  public categories: Category[] = [];

  ngOnInit() { 
    this.formProd = this.fb.group({
      prod_code: [''],
      prod_name: ['', Validators.required],
      prod_quantity_available: [0],
      prod_sale_price: [0, Validators.required],
      prod_purchase_cost: [0],
      prod_category_id: ['', Validators.required],
      prod_description: [''],
      prod_image: ['']
    });


    this.getCategories();
  }


  async getCategories() {
    try {
      // 👇 Espera al primer valor del observable
      this.categories = await firstValueFrom(this.categoryService.getCategories());
      console.log('Empleados:', this.categories);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }


  async onSubmit(){
    console.log(this.formProd.value);

    this.loading = true;
    if (!this.formProd.valid) {
        toast.error('Los campos son obligatorios');
    }

    await this.uploadService
          .uploadImage(this.files[0])
          .then(async (result: any) => {
            this.imgPoduct = result;
            console.log(this.imgPoduct);
            if (!this.imgPoduct) {
              this.loading = false;
              toast.error('Error al subir imagen');

              return;
            }

            try {
              this.formProd.value.prod_image = this.imgPoduct;

              const data = await this.productService.addProductToCategory( this.formProd.value.prod_category_id, this.formProd.value);
              console.log(data);
              this.loading = false;
        
              toast.success('Producto creado');
              console.log('Empleados:', this.categories);
              this.formProd.reset();
              this.files = [];
            } catch (error) {
              this.loading = false;
              toast.error('Error al crear producto');
              console.error('Error al cargar empleados:', error);
            }
          })
          .catch((err) => {
            this.loading = false;
            console.error('Error al cargar empleados:', err);
          }); 

    

  }

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

}
