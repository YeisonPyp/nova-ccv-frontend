import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TreeMenuComponent } from '../tree-menu/tree-menu.component';
import { MenuService } from '@/app/core/services/menu.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TreeMenuComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private menuService = inject(MenuService);

  menuNodes = this.menuService.menuNodes;
  isLoading = this.menuService.isLoading;
}
