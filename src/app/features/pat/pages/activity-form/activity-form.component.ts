import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-activity-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './activity-form.component.html',
  styleUrl: './activity-form.component.scss'
})
export class ActivityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private activityService = inject(ActivityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activityForm!: FormGroup;
  programId = signal<number>(0);
  isEditMode = signal(false);
  activityId = signal<number | null>(null);
  submitting = signal(false);

  ngOnInit() {
    this.programId.set(+this.route.snapshot.paramMap.get('programId')!);
    this.initForm();
    this.checkEditMode();
  }

  private initForm() {
    this.activityForm = this.fb.group({
      programId: [this.programId()],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      unidadMedida: ['', [Validators.required, Validators.maxLength(50)]],
      metaTotal: [1, [Validators.required, Validators.min(1)]],
      displayOrder: [0, Validators.min(0)]
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('activityId');
    if (id) {
      this.isEditMode.set(true);
      this.activityId.set(+id);
      this.loadActivity(+id);
    }
  }

  private loadActivity(id: number) {
    this.activityService.getActivityById(id).subscribe({
      next: (response) => {
        this.activityForm.patchValue(response.data);
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar la actividad');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const request = this.activityForm.value;

    this.activityService.createActivity(request).subscribe({
      next: (response) => {
        alert(response.message);
        this.goBack();
      },
      error: (err) => {
        this.submitting.set(false);
        alert('Error: ' + (err.error?.message || 'Error al guardar'));
      }
    });
  }

  goBack() {
    this.router.navigate(['/pat/programs', this.programId()]);
  }
}