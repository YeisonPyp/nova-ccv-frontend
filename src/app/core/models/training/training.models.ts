export interface Training {
  id: number;
  topicName: string;
  modalityName: string;
  trainerName: string;
  trainerLastname?: string;
  areaName?: string;
  type: string;
  status: string;
  location: string;
  durationHours: number;
  cost: number;
  scheduledDate: string;
}

export interface TrainingSession {
  id: number;
  trainingId?: number;
  sessionDate: string; // ISO date (yyyy-MM-dd)
  startsMinutes: number; // minutes since midnight
  endsMinutes: number;
}

export interface TrainingParticipant {
  id: number;
  trainingId: number;
  employeeId: number;
  employeeName: string;
  employeeLastname: string;
  employeeEmail: string;
  score?: number;
  approved: boolean;
  status: string;
  registeredAt: string;
}

export interface TrainingSurveyQuestion {
  id: number;
  description: string;
  impact?: number;
  score?: number; // Depending on usage
}

/** Who a training survey is aimed at. */
export type SurveyAudience = 'EMPLOYEES' | 'TRAINING';

export interface TrainingSurveyImpact {
  id: number;
  questionId: number;
  questionDescription: string;
  questionMin?: number;
  questionMax?: number;
  impact: number;
}

export interface TrainingSurvey {
  id: number;
  trainingId: number;
  surveyId: number;
  surveyTitle: string;
  aimedAt?: SurveyAudience;
  impacts?: TrainingSurveyImpact[];
  questions?: TrainingSurveyQuestion[]; // mapped from impact if needed or just questions
}

export interface TrainingDetail {
  id: number;
  topicId: number;
  topicName: string;
  modalityId: number;
  modalityName: string;
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
  trainingProgramId?: number;
  requestId?: number;
  type: string;
  location: string;
  durationHours: number;
  cost: number;
  description: string;
  status: string;
  scheduledDate: string;
  createdAt: string;
  sessions?: TrainingSession[];
  participants?: TrainingParticipant[];
  surveys?: TrainingSurvey[];
}

export interface CreateTrainingDto {
  topicId: number;
  modalityId: number;
  responsibleEmployeeId: number;
  trainerId: number;
  priorityId?: number;
  areaId?: number;
  trainingProgramId?: number;
  requestId?: number;
  type: string;
  location: string;
  durationHours: number;
  cost: number;
  description: string;
  status: string;
  scheduledDate: string;
}

export interface CreateTrainingSessionDto {
  sessionDate: string; // yyyy-MM-dd
  startsMinutes: number;
  endsMinutes: number;
}

export interface EnrollParticipantDto {
  employeeId: number;
}

export interface UpdateParticipantDto {
  score?: number;
  approved: boolean;
  status: string;
}

export interface AttachTrainingSurveyDto {
  surveyId: number;
  aimedAt: SurveyAudience;
  evaluatorId?: number;
  /** Postgres interval (e.g. "4 months"); resurfaces the survey in assessments. */
  feedbackAfter?: string | null;
}

/** A training survey resurfaced inside a performance assessment. */
export interface TrainingEffectivenessQuestion {
  questionId: number;
  description: string;
  minValue?: number;
  maxValue?: number;
  score?: number | null;
}

export interface TrainingEffectiveness {
  trainingAssessmentId: number;
  trainingSurveyId: number;
  trainingId: number;
  trainingTopic: string;
  trainingDate: string;
  surveyId: number;
  surveyName: string;
  aimedAt: SurveyAudience;
  questions: TrainingEffectivenessQuestion[];
}

export interface SetQuestionImpactDto {
  questionId: number;
  impact: number;
}

export interface TrainingSurveyAnswer {
  id?: number;
  employeeId?: number;
  questionId: number;
  score: number;
}

export interface SubmitTrainingAnswerItem {
  questionId: number;
  score: number;
}

export interface SubmitTrainingAnswersDto {
  trainingAssessmentId: number;
  answers: SubmitTrainingAnswerItem[];
}

// ── Metrics ──
export interface TrainingQuestionMetric {
  questionId: number;
  description: string;
  avgScore: number | null;
  answeredCount: number;
}

export interface TrainingSurveyMetric {
  surveyId: number;
  surveyName: string;
  aimedAt: SurveyAudience;
  avgScore: number | null;
  answeredCount: number;
  questions: TrainingQuestionMetric[];
}

export interface TrainingMetrics {
  surveys: TrainingSurveyMetric[];
}
