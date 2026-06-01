export interface PatPillar {
  id: number;
  name: string;
  description: string;
}

export interface PatStrategicProgram {
  id: number;
  name: string;
  description: string;
  year: number;
  pillar: PatPillar;
}

export interface PatPolicy {
  id: number;
  name: string;
  description: string;
}

export interface PatTacticalActivity {
  id: number;
  name: string;
  code: string;
  description: string;
  year: number;
}

export interface PatActivityConsolidation {
  approvedBudget: number;
  executedBudget: number;
  plannedBudget: number;
  unexecutedBudget: number;

  plannedMeasurementGoal: number;
  plannedMeasurement: number;
  executedMeasurementGoal: number;
  pendingMeasurementGoal: number;

  plannedIndicatorGoal: number;
  plannedIndicator: number;
  executedIndicatorGoal: number;
  pendingIndicatorGoal: number;
  plannedBenefitGoal: number;
  plannedBenefit: number;
  executedBenefitGoal: number;
  pendingBenefitGoal: number;
  updatedAt: string;
}

export interface PatActivity {
  id: number;
  code: string;
  name: string;
  description: string;
  program: PatStrategicProgram;
  policy: PatPolicy;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
  consolidation?: PatActivityConsolidation;
}

export interface PatMeasurement {
  id: number;
  name: string;
  description: string;
}

export interface PatTacticalActivity {
  id: number;
  name: string;
  code: string;
  description: string;
  year: number;
}

export interface PatSpecificObjective {
  id: number;
  name: string;
  code: string;
  description: string;
  year: number;
  tacticalActivities: PatTacticalActivity[];
}

export interface PatBenefitType {
  id: number;
  name: string;
}

export interface PatStrategicObjective {
  id: number;
  name: string;
  code: string;
  year: number;
  description?: string;
}

export interface PatProduct {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface PatCuantitativeIndicator {
  id: number;
  name: string;
  description: string;
}

export interface PatCualitativeIndicator {
  id: number;
  name: string;
  description: string;
}
