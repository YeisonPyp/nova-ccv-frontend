import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuNode } from '../../../core/services/menu.service';

@Component({
  selector: 'app-tree-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tree-menu.component.html',
  styleUrl: './tree-menu.component.scss'
})
export class TreeMenuComponent {
  @Input() menu: MenuNode[] = [];
  @Input() level: number = 0;

  toggle(node: MenuNode): void {
    node.expanded = !node.expanded;
  }

  hasChildren(node: MenuNode): boolean {
    return !!node.children && node.children.length > 0;
  }

  hasRoute(node: MenuNode): boolean {
    return !!node.route && node.route.trim().length > 0;
  }

  isExternalLink(node: MenuNode): boolean {
    if (!node.route) return false;
    if (node.external === true) return true;
    return node.route.startsWith('http://') || 
           node.route.startsWith('https://') || 
           node.route.startsWith('//');
  }

  isInternalLink(node: MenuNode): boolean {
    return this.hasRoute(node) && !this.isExternalLink(node);
  }

  trackByLabel(index: number, node: MenuNode): string {
    return node.label + index;
  }
}