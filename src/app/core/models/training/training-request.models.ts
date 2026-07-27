export interface TrainingRequest {
  id: number;
  topic: string;
  trainingTopicName: string;
  modalityName: string;
  priorityName: string;
  type: string;
  duration: number;
  status: string;
  requestingUserFirstName?: string;
  requestingUserLastName?: string;
  createdAt: string;
}

export interface TrainingRequestEmployee {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeLastName: string;
  employeeEmail: string;
}

export interface TrainingRequestDetail {
  id: number;
  trainingTopicId: number;
  trainingTopicName: string;
  modalityId: number;
  modalityName: string;
  priorityId: number;
  priorityName: string;
  topic: string;
  justification: string;
  duration: number;
  type: string;
  content?: string;
  status: string;
  response?: string | null;
  responseDate?: string | null;
  createdAt: string;
  requestingUserId?: number;
  requestingUserFirstName?: string;
  requestingUserLastName?: string;
  redirectingUserFirstName?: string | null;
  redirectingUserLastName?: string | null;
  respondingUserFirstName?: string | null;
  respondingUserLastName?: string | null;
  employees: TrainingRequestEmployee[];
}

export interface CreateTrainingRequestDto {
  trainingTopicId: number;
  priorityId: number;
  modalityId: number;
  topic: string;
  justification: string;
  duration: number;
  content?: string | null;
  type: string;
  employeeIds: number[];
}

export interface RespondTrainingRequestDto {
  response: string;
  status: string;
}

export interface ConvertRequestToTrainingDto {
  responsibleEmployeeId: number;
  trainerId: number;
  areaId?: number | null;
  location: string;
  cost: number;
  scheduledDate: string;
  status: string;
}
