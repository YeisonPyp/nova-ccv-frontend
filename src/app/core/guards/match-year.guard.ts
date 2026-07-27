import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const matchYearGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const yearParam = segments[0]?.path;
  const isNumber = !!yearParam && !isNaN(Number(yearParam));
  if (!isNumber) {
    const currentYear = new Date().getFullYear();

    router.navigate([`/${currentYear}`]);
    return false;
  }

  return true;
};
