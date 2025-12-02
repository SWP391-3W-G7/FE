export type UserRole = 'STUDENT' | 'STAFF' | 'SECURITY';

export type ItemStatus = 'PENDING' | 'VERIFIED' | 'RETURNED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  campusId?: string; 
}

export interface Campus {
  id: string;
  name: string; 
  address: string;
}

export interface LostItem {
  id: string;
  title: string;
  description: string;
  type: 'LOST' | 'FOUND';
  status: ItemStatus;
  locationDetail: string; 
  campusId: string; 
  reportDate: string;
  images: string[];
  ownerId?: string; 
  finderId?: string; 
}