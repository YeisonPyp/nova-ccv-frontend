import { AfterViewInit, Directive, ElementRef, HostListener, inject } from "@angular/core";

@Directive({
  selector: "textarea[appAutosize]",
  standalone: true,
})
export class AutosizeTextareaDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLTextAreaElement>);

  ngAfterViewInit(): void {
    this.resize();
  }

  @HostListener("input")
  onInput(): void {
    this.resize();
  }

  private resize(): void {
    const textarea = this.el.nativeElement;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
