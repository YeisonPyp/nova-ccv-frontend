import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AppNotificationDto } from '../../../core/models/notification/notification.model';

const POLL_INTERVAL_MS = 2 * 60 * 1000;

/**
 * Owns everything that sits outside the page content: the sidebar and the top
 * bar. The layout only reserves the room the sidebar takes up.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private menuService = inject(MenuService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isCollapsed = this.menuService.isCollapsed;

  currentUser = this.authService.currentUser;
  showUserMenu = false;
  showNotifications = false;

  unreadCount = signal(0);
  notifications = signal<AppNotificationDto[]>([]);

  ngOnInit(): void {
    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.notificationService.unreadCount()),
      )
      .subscribe((res) => {
        if (res.success) this.unreadCount.set(res.data);
      });
  }

  onToggleSidebar(): void {
    this.menuService.toggleSidebar();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.findMine(0, 10).subscribe((res) => {
        if (res.success) this.notifications.set(res.data.content);
      });
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  openNotification(n: AppNotificationDto): void {
    if (!n.read) {
      this.notificationService.markRead(n.id).subscribe(() => {
        this.unreadCount.update((c) => Math.max(0, c - 1));
      });
    }
    this.closeNotifications();
    if (n.link) this.router.navigateByUrl(n.link);
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeUserMenu();
  }
}
