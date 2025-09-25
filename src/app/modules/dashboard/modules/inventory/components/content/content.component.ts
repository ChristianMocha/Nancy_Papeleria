import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../../../../service/category.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-content',
  imports: [CommonModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

  private readonly categoryService = inject(CategoryService);

  public lstCategories: any[] = [];

  ngOnInit() {
    this.getAllCategories();
  }
  


async getAllCategories() {
  this.categoryService.getCategories().subscribe({
    next: (res) => console.log('✅ Categorías:', res),
    error: (err) => console.error('❌ Error:', err),
  });
}

}
