import { Component, effect, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./pat-layout.component.html",
})
export class PatLayoutComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  year = signal<number>(new Date().getFullYear());

  constructor() {
    effect(() => {
      const year = this.year();
      const currentSubRoute = this.router.url.split("/").slice(3).join("/");
      this.router.navigate([`/pat/${year}/${currentSubRoute}`]);
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const year = params.get("year");
      if (year) this.setYear(year);
    });
  }

  private setYear(y: string) {
    if (Number.isInteger(Number(y))) this.year.set(Number(y));
    else this.year.set(new Date().getFullYear());
  }

  onYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newYear = select.value;
    this.setYear(newYear);
  }
}
