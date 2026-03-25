import { CommonModule } from "@angular/common";
import { Component, forwardRef, inject, input, OnInit, output } from "@angular/core";
import { EvidenceItemComponent } from "../../../components/evidence-item/evidence-item.component";
import { CorrectiveActionSectionComponent } from "../corrective-action-section.component";
import { CorrectiveActionDto } from "../../../../../../../core/models/improvement-plan/corrective-action.model";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from "@angular/forms";
import { CorrectiveActionService, correctiveActionStatus } from "../../../../../../../core/services/improvement-plan/corrective-action.service";
import { debounceTime, distinctUntilChanged, filter, switchMap } from "rxjs";


@Component({
    selector: "app-corrective-action-details",
    standalone: true,
    imports: [
        CommonModule,
        EvidenceItemComponent,
        forwardRef(() => CorrectiveActionSectionComponent),
        ReactiveFormsModule
    ],
    templateUrl: "./corrective-action-details.component.html",
    styleUrl: "./corrective-action-details.component.scss",
})
export class CorrectiveActionDetailsComponent implements OnInit {
    action = input.required<CorrectiveActionDto>();
    planId = input.required<number>();

    onDelete = output<CorrectiveActionDto>();

    service = inject(CorrectiveActionService);

    formGroup: FormGroup;

    constructor(private fb: FormBuilder) {
        this.formGroup = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            progress: [Validators.min(0), Validators.max(100)],
            status: new FormControl(Object.values(correctiveActionStatus)),
        });
    }

    ngOnInit(): void {
        this.formGroup.patchValue(this.action(), { emitEvent: false });
        this.formGroup.valueChanges.pipe(
            debounceTime(800),
            filter(() => this.formGroup.valid),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
            switchMap(values => this.service.update(this.action().id, values))
        ).subscribe({
            next: (r) => {
                console.log("update response: ", r);
                console.log('Cambios guardados automáticamente');
            },
            error: (err) => console.error('Error al guardar:', err)
        });
    }

    onDeleteCorrectiveAction() {
        this.service.deleteById(this.action().id).subscribe((r) => {
            if (r.success) {
                this.onDelete.emit(r.data);
            }
        });
    }
}