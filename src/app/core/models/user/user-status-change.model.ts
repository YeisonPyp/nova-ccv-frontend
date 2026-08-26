export type UserStatus = "active" | "inactive" | "ban" | "suspended";

export const USER_STATUSES: UserStatus[] = [
  "active",
  "inactive",
  "ban",
  "suspended",
];

export interface UserStatusChange {
  id: number;
  userId: number;
  oldStatus: UserStatus;
  newStatus: UserStatus;
  reason: string;
  createdById: number;
  createdAt: string;
}
