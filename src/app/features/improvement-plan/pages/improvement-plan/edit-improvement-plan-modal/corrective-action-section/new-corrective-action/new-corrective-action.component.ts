import { CommonModule } from "@angular/common";
import { Component, inject, input, output } from "@angular/core";
import { EmployeeService } from "../../../../../../../core/services/assessment/employee.service";
import { SearchSelectComponent } from "../../../../../../../shared/components/search-select/search-select.component";
import { CorrectiveActionService } from "../../../../../../../core/services/improvement-plan/corrective-action.service";
import { CorrectiveActionDto } from "../../../../../../../core/models/improvement-plan/corrective-action.model";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
    selector: "app-new-corrective-action",
    standalone: true,
    imports: [
        CommonModule,
        SearchSelectComponent,
        ReactiveFormsModule
    ],
    templateUrl: "./new-corrective-action.component.html",
    styleUrl: "./new-corrective-action.component.scss",
})
export class NewCorrectiveActionComponent {
    employeeService = inject(EmployeeService);
    service = inject(CorrectiveActionService);
    private readonly fb = inject(FormBuilder);

    form = this.fb.group({
        dueDate: ['', Validators.required],
        employeeId: [0, Validators.required],
        name: ['', Validators.required]
    });

    planId = input.required<number>();
    parentId = input<number>();

    onCreated = output<CorrectiveActionDto>();

    searchSelectEmployeeContext = this.employeeService.newSearchSelectEmployeeContext((e) => {
        this.form.patchValue({ employeeId: e.id });
    }, {
        maxItems: 1,
        placeholder: "Responsable...",
        isRequired: true,
    });

    onEnterPressed(e: Event) {
        if (!this.form.valid) {
            console.log(this.form.errors);
            return;
        }
        const { employeeId, name, dueDate } = this.form.value;
        this.service.create({
            improvementPlanId: this.planId(),
            parentId: this.parentId(),
            employeeId: employeeId!,
            expiresAt: dueDate!,
            name: name!
        }).subscribe((r) => {
            (e.target as HTMLInputElement).value = '';
            this.searchSelectEmployeeContext.clear();
            this.onCreated.emit(r.data);
        });
    }
}