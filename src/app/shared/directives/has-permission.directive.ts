import { AuthService } from "@/app/core/services/auth.service";
import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";

/**
 * Directive to hide UI elements when user has not permissions, for example, a create button.
 * Inject in the component and use mode:
 *
 *  *appHasPermission="['MY_PERMISSION']"
 */
@Directive({
  selector: "[appHasPermission]",
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);
  public readonly appHasPermission = input.required<string[]>();

  private isViewCreated = false;

  private readonly _ = effect(() => {
    const required = this.appHasPermission();

    const hasAccess = required.every((p) => this.authService.hasPermission(p));

    if (hasAccess && !this.isViewCreated) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isViewCreated = true;
    } else if (!hasAccess && this.isViewCreated) {
      this.viewContainer.clear();
      this.isViewCreated = false;
    }
  });
}
