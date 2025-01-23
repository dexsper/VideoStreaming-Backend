import { UserRole } from '../../users/user.entity';

export interface User {
  id: number;
  roles: UserRole[];
}
