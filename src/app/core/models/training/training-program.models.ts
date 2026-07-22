import { SurveyAudience } from './training.models';

export interface TrainingProgram {
  id: number;
  topicName: string;
  modalityName: string;
  trainingTypeName: string;
  trainerName: string;
  trainerLastname?: string;
  areaName?: string;
  durationHours: number;
  startsAt: string; // yyyy-MM-dd
  endsAt: string;
}

export interface ProgramScheduleRow {
  id?: number;
  weekDay: number; // 1 = Monday … 7 = Sunday
  startsMinutes: number;
  endsMinutes: number;
}

export interface ProgramEmployee {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeLastName: string;
  employeeEmail: string;
}

export interface ProgramSurvey {
  id: number;
  surveyId: number;
  surveyName: string;
  evaluatorId?: number | null;
  evaluatorName?: string | null;
  aimedAt: SurveyAudience;
}

export interface TrainingProgramDetail {
  id: number;
  topicId: number;
  topicName: string;
  modalityId: number;
  modalityName: string;
  trainingTypeId: number;
  trainingTypeName: string;
  responsibleId: number;
  responsibleName: string;
  responsibleLastName: string;
  trainerId: number;
  trainerName: string;
  trainerLastname?: string;
  priorityId?: number;
  priorityName?: string;
  areaId?: number;
  areaName?: string;
  durationHours: number;
  sessionHours: number;
  startsAt: string;
  endsAt: string;
  objective?: string;
  content?: string;
  staffCount?: number;
  schedule: ProgramScheduleRow[];
  employees: ProgramEmployee[];
  surveys: ProgramSurvey[];
}

export interface CreateProgramScheduleRow {
  weekDay: number;
  startsMinutes: number;
  endsMinutes: number;
}

export interface CreateTrainingProgramDto {
  topicId: number;
  modalityId: number;
  trainingTypeId: number;
  responsibleEmployeeId: number;
  trainerId: number;
  priorityId?: number | null;
  areaId?: number | null;
  durationHours: number;
  sessionHours: number;
  startsAt: string;
  endsAt: string;
  objective?: string | null;
  content?: string | null;
  staffCount?: number | null;
  schedule: CreateProgramScheduleRow[];
}

// ── Metrics of related trainings ──
export interface ProgramTrainingMetric {
  trainingId: number;
  topicName: string;
  status: string;
  scheduledDate: string;
  participantCount: number;
  avgScore: number | null;
}

export interface ProgramMetrics {
  totalTrainings: number;
  totalParticipants: number;
  overallAvgScore: number | null;
  trainings: ProgramTrainingMetric[];
}
