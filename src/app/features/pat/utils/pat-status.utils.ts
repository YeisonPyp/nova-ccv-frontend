// pat/utils/pat-status.utils.ts
import { ProgramStatus, TrainingStatus, IndicatorType } from '../models/pat.models';

export const PROGRAM_STATUS_CONFIG: Record<
  ProgramStatus,
  { label: string; cssClass: string; icon: string; color: string }
> = {
  DRAFT:       { label: 'Borrador',     cssClass: 'borrador',   icon: 'draft',    color: '#6c757d' },
  APPROVED:    { label: 'Aprobado',     cssClass: 'aprobado',   icon: 'verified', color: '#0d6efd' },
  IN_PROGRESS: { label: 'En Ejecución', cssClass: 'ejecucion',  icon: 'pending',  color: '#198754' },
  CLOSED:      { label: 'Cerrado',      cssClass: 'cerrado',    icon: 'archive',  color: '#dc3545' },
};

export const TRAINING_STATUS_CONFIG: Record<
  TrainingStatus,
  { label: string; cssClass: string }
> = {
  REGISTERED:  { label: 'Inscrito',       cssClass: 'inscrito'   },
  IN_PROGRESS: { label: 'En Curso',       cssClass: 'en-curso'   },
  COMPLETED:   { label: 'Completado',     cssClass: 'completado' },
  ABSENT:      { label: 'No Asistió',     cssClass: 'ausente'    },
};

export const INDICATOR_TYPE_CONFIG: Record<
  IndicatorType,
  { label: string; icon: string }
> = {
  QUANTITY:   { label: 'Cantidad',    icon: 'tag'           },
  PERCENTAGE: { label: 'Porcentaje',  icon: 'percent'       },
  BINARY:     { label: 'Binario',     icon: 'toggle_on'     },
  CURRENCY:   { label: 'Monetario',   icon: 'attach_money'  },
};

export function getProgramStatusLabel(status: ProgramStatus): string {
  return PROGRAM_STATUS_CONFIG[status]?.label ?? status;
}

export function getProgramStatusClass(status: ProgramStatus): string {
  return PROGRAM_STATUS_CONFIG[status]?.cssClass ?? status.toLowerCase();
}

export function getTrainingStatusLabel(status: TrainingStatus): string {
  return TRAINING_STATUS_CONFIG[status]?.label ?? status;
}

export function getProgressColor(pct: number): string {
  if (pct >= 80) return 'success';
  if (pct >= 50) return 'warning';
  return 'danger';
}

export const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2019 },
  (_, i) => CURRENT_YEAR + 1 - i,
);