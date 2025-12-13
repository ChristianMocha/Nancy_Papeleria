// shared/guards/initial-redirect.guard.ts
import { CanMatchFn } from '@angular/router';

export const isMobileGuard: CanMatchFn = () => {
  return window.innerWidth <= 768;
};

export const isDesktopGuard: CanMatchFn = () => {
  return window.innerWidth > 768;
};
