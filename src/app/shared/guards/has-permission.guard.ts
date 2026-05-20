import { AuthService } from "@/app/core/services/auth.service";
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const hasPermissionGuard = (
  allowedPermissions: string[],
): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!allowedPermissions.every((p) => authService.hasPermission(p))) {
      return router.createUrlTree(["/forbidden"]);
    }

    return true;
  };
};
