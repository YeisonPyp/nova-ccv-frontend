export interface UserResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  statusReason: string;
  enabled: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
}
