import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  public router = inject(Router);
  public currentPage: string = '';

  ngOnInit() {
     this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPage = event.urlAfterRedirects.replace('/', '');
      });
  }

  goToPage(path: string){
    console.log(path);
    this.router.navigate([path]);
    this.currentPage = path;
  }

}
