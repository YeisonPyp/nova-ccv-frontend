import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../core/services/auth.service";
import { PatHomeDashboardComponent } from "../pat/pages/home-dashboard/home-dashboard.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, PatHomeDashboardComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  authService = inject(AuthService);

  currentDate = new Date();

  /**
   * Year the dashboard is scoped to. Kept here rather than read from the
   * route so the dashboard also works outside the PAT layout; mounting it
   * under `/pat/:year` just means binding that param to `[year]` instead.
   */
  year = signal<number>(new Date().getFullYear());

  get greeting(): string {
    const hour = this.currentDate.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    return user?.firstName || user?.username || "Usuario";
  }

  onYearChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isInteger(value) && value > 1900) this.year.set(value);
  }
}
