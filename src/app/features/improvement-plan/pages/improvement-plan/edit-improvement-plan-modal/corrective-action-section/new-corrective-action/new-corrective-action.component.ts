import { CommonModule } from "@angular/common";
import { Component, inject, input, output, signal } from "@angular/core";
import { EmployeeService } from "../../../../../../../core/services/assessment/employee.service";
import { SearchSelectComponent } from "../../../../../../../shared/components/search-select/search-select.component";
import { ChipItemComponent } from "../../../../../../../shared/components/search-select/chip-item/chip-item.component";
import { SearchSelectOption } from "../../../../../../../shared/components/search-select/on-search-select.interface";
import { CorrectiveActionService } from "../../../../../../../core/services/improvement-plan/corrective-action.service";
import { CorrectiveActionDto } from "../../../../../../../core/models/improvement-plan/corrective-action.model";

@Component({
    selector: "app-new-corrective-action",
    standalone: true,
    imports: [
        CommonModule,
        SearchSelectComponent,
        ChipItemComponent
    ],
    templateUrl: "./new-corrective-action.component.html",
    styleUrl: "./new-corrective-action.component.scss",
})
export class NewCorrectiveActionComponent {
    employeeService = inject(EmployeeService);
    service = inject(CorrectiveActionService);
    selectedDueDate = signal<string | null>(null);

    planId = input.required<number>();
    parentId = input<number>();

    onCreated = output<CorrectiveActionDto>();

    searchSelectEmployeeContext = this.employeeService.newSearchSelectEmployeeContext((_) => { }, {
        maxItems: 1,
        placeholder: "Responsable...",
        isRequired: true,
    });

    get dueDateOption(): SearchSelectOption | null {
        const due = this.selectedDueDate();
        if (!due) return null;
        return { id: 'abc123', title: new Date(due).toLocaleDateString() }
    }

    onRemoveDueDate(op: SearchSelectOption) {
        this.selectedDueDate.set(null);
    }

    onDateSelected(e: Event) {
        const t = (e.target as HTMLInputElement).valueAsDate;
        this.selectedDueDate.set(t?.toISOString() ?? null);
    }

    onEnterPressed(e: Event) {
        this.service.create({
            improvementPlanId: this.planId(),
            parentId: this.parentId(),
            employeeId: this.searchSelectEmployeeContext.selectedOptions()[0].id as number,
            expiresAt: this.selectedDueDate()!,
            name: (e.target as HTMLInputElement).value
        }).subscribe((r) => {
            (e.target as HTMLInputElement).value = '';
            this.searchSelectEmployeeContext.clear();
            this.selectedDueDate.set(null);
            this.onCreated.emit(r.data);
        });
    }
}