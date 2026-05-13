import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error';

export interface Toast {
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  showSuccess(message: string) {
    this.show({ type: 'success', message });
  }

  showError(message: string) {
    this.show({ type: 'error', message });
  }

  showWarning(message: string) {
    this.show({ type: 'error', message });
  }

  private show(toast: Toast) {
    this.toastSubject.next(toast);

    setTimeout(() => {
      this.toastSubject.next(null);
    }, 3000);
  }
}
