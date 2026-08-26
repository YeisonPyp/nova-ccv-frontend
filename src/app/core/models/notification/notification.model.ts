export interface AppNotificationDto {
  id: number;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
