import { Component, inject, input } from "@angular/core";
import { Location } from "@angular/common";

@Component({
  selector: "app-forbidden",
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center text-center py-16 px-6">
      <div class="text-6xl mb-4">🔒</div>
      <h1 class="text-2xl font-bold text-secondary mb-2">Acceso denegado</h1>
      <p class="text-tertiary mb-6 max-w-md">{{ message() }}</p>
      <button class="btn btn-primary" (click)="back()">Volver</button>
    </div>
  `,
})
export class ForbiddenComponent {
  message = input<string>(
    "No tienes los permisos necesarios para ver esta pantalla. Contacta a un administrador si crees que es un error."
  );

  private location = inject(Location);

  back() {
    this.location.back();
  }
}
