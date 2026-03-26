import { CommonModule } from "@angular/common";
import { Component, forwardRef, inject, input, OnInit, output, signal } from "@angular/core";
import { EvidenceItemComponent } from "../../../components/evidence-item/evidence-item.component";
import { CorrectiveActionSectionComponent } from "../corrective-action-section.component";
import { CorrectiveActionDto } from "../../../../../../../core/models/improvement-plan/corrective-action.model";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CorrectiveActionService, CorrectiveActionStatus, correctiveActionStatus } from "../../../../../../../core/services/improvement-plan/corrective-action.service";
import { debounceTime, distinctUntilChanged, filter, switchMap } from "rxjs";
import { EvidenceDto } from "../../../../../../../core/models/improvement-plan/evidence.model";
import { toObservable } from "@angular/core/rxjs-interop";


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

    evidences = signal<EvidenceDto[]>([]);

    onDelete = output<CorrectiveActionDto>();

    service = inject(CorrectiveActionService);

    formGroup: FormGroup;

    get correctiveActionStatus() {
        return Object.keys(correctiveActionStatus) as Array<CorrectiveActionStatus>;
    }

    getCorrectiveActionStatusName(k: CorrectiveActionStatus) {
        return correctiveActionStatus[k];
    }

    constructor(private fb: FormBuilder) {
        this.formGroup = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            progress: [Validators.min(0), Validators.max(100)],
            status: new FormControl(Object.values(correctiveActionStatus)),
        });

        toObservable(this.action).subscribe((a) => {
            this.evidences.set(a.evidences ?? []);
            this.formGroup.patchValue({
                name: a.name,
                description: a.description,
                progress: a.progress * 100,
                status: a.status
            }, { emitEvent: false });
        })
    }

    ngOnInit(): void {
        this.formGroup.valueChanges.pipe(
            debounceTime(800),
            filter(() => this.formGroup.valid),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
            switchMap(values => this.service.update(this.action().id, { ...values, progress: values.progress ? values.progress / 100 : undefined }))
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

    onSaveEvidence(e: EvidenceDto) {
        const ev = this.evidences().reduce((prev, curr) => {
            prev[curr.id] = curr;
            return prev;
        }, {} as Record<number, EvidenceDto>);
        ev[e.id] = e;

        this.evidences.set(Object.values(ev));
    }

    onRemoveEvidence(ev: EvidenceDto) {
        this.evidences.set(this.evidences().filter((e) => e.id !== ev.id));
    }

    get assignedEmployeeFullName() {
        return [this.action().employee?.name, this.action().employee?.lastName].filter((i) => i).join(' ');
    }

    get dueDate() {
        return new Date(this.action().expiresAt);
    }
}