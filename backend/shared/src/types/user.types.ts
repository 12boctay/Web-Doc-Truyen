export type UserRole = 'guest' | 'user' | 'moderator' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'banned' | 'suspended';
export type DonorBadge = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  name: string;
  slug: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  bannedUntil: Date | null;
  bannedReason: string;
  totalDonated: number;
  donorBadge: DonorBadge;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
