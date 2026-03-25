import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { SearchSelectOption } from "../on-search-select.interface";

@Component({
    selector: "app-chip-item",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./chip-item.component.html",
    styleUrl: "./chip-item.component.scss",
})
export class ChipItemComponent {
    op = input.required<SearchSelectOption>();
    onRemove = output<SearchSelectOption>();

    onClickRemove(e: Event) {
        this.onRemove.emit(this.op());
    }
}