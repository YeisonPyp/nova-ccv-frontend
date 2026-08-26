export interface ScheduleDay {
  id: number;
  weekDay: number;
  utcStartsMinutes: number;
  utcEndsMinutes: number;
}

export interface Schedule {
  id: number;
  name: string;
  description: string;
  days: ScheduleDay[];
}
