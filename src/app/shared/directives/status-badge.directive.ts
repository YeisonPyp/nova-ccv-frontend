import { Directive, effect, ElementRef, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appStatusBadge]',
})
export class StatusBadgeDirective {
  appStatusBadge = input.required<string>();

  private currentClass: string[] = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    effect(() => {
      const statusValue = this.appStatusBadge();
      this.updateStatusClass(statusValue);
    });
  }

  private updateStatusClass(statusValue: string): void {
    const hostElement = this.el.nativeElement;

    if (this.currentClass) {
      this.currentClass.forEach((cls) => {
        this.renderer.removeClass(hostElement, cls);
      });
    }

    this.currentClass = this.getClassForStatus(statusValue);
    if (this.currentClass) {
      this.currentClass.forEach((cls) => {
        this.renderer.addClass(hostElement, cls);
      });
    }
  }

  private getClassForStatus(status: string): string[] {
    if (!status) return ['bg-secondary'];

    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
      case 'completado':
        return ['bg-success'];
      case 'pending':
      case 'en_progreso':
        return ['bg-warning'];
      case 'rejected':
      case 'failed':
      case 'cancelado':
        return ['bg-danger'];
      default:
        return ['bg-secondary'];
    }
  }
}
