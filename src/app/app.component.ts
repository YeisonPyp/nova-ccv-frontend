import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuNode } from './features/pat/models/pat.models';
import { TreeMenuComponent } from "./shared/components/tree-menu/tree-menu.component";
import { MENU_DATA } from './shared/data/menu-data';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TreeMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pat-frontend';
   menuData = MENU_DATA;
}
