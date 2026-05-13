import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './modules/shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Nancy';

  ngOnInit(): void {
    setInterval(
      () => {
        window.location.reload();
      },
      4 * 60 * 60 * 1000,
    );
  }
}
