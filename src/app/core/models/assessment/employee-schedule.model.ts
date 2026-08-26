export interface EmployeeSchedule {
  id: number;
  employeeId: number;
  userId: number;
  weekDay: number;
  utcStartsMinutes: number;
  utcEndsMinutes: number;
}
