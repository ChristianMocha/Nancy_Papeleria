// shared/guards/device.guard.ts
import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const isMobile = () => window.innerWidth <= 768;

export const mobileOnlyGuard: CanMatchFn = () => {
  const router = inject(Router);

  if (!isMobile()) {
    router.navigate(['/movements']); // desktop fallback
    return false;
  }

  return true;
};

export const desktopOnlyGuard: CanMatchFn = () => {
  const router = inject(Router);

  if (isMobile()) {
    router.navigate(['/home']); // mobile fallback
    return false;
  }

  return true;
};
