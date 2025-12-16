export type UserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";
// ==========================================
// MAP THEO DATABASE TABLES
// ==========================================

// Table Role
export interface Role {
  roleID: number;
  roleName: string; // 'Student', 'Staff', 'Admin'
}

// Table Camp

// Table Category
export interface Category {
  categoryId: number;
  categoryName: string; // VD: Ví, Laptop
}

export interface LostItem {
  lostItemId: number;
  title: string; 
  description: string; 
  lostDate: string; 
  lostLocation: string;
  status: "Open" | "Closed" | "Found";
  campusId: number;
  campusName: string;
  categoryId: number;
  categoryName: string;
  imageUrls: string[];
  actionLogs: null;
}

export interface CreateLostItemRequest {
  title: string;
  description: string;
  lostDate: string;
  lostLocation: string;
  campusID: number;
  categoryID: number;
}


// Table FoundItem (Đồ nhặt được)
export interface FoundItem {
  foundItemId: number;
  title: string;
  description: string;
  foundDate: string; // ISO datetime
  foundLocation: string;
  status: "Open" | "Stored" | "Returned";
  campusId: number;
  campusName: string;
  categoryId: number;
  categoryName: string;
  createdBy: number;
  storedBy: number | null;
  imageUrls: string[];
  claimRequests: Claim[] | null;
  actionLogs: null;
}


export interface User {
  email: string;
  fullName: string;
  role: UserRole;
  campusName: string;
  campusId: number;
}

// Type cho API response khi login thành công
export interface LoginResponse {
  user: User;
  token: string;
}

export interface Campus {
  id: number;
  name: string;
  description: string;
}

export interface Claim {
  claimId: number
  claimDate: string
  status: 'Pending' | 'Approved' | 'Rejected'
  foundItemId: number | null
  lostItemId: number | null
  foundItemTitle: string | null
  studentId: number
  studentName: string | null
  evidences: Evidence[]
  actionLogs: string
}

export interface Evidence {
  evidenceId: number
  title: string
  description: string
  createdAt: string
  imageUrls: string[]
}

export interface StaffReport {
  totalFound: number;
  returnedCount: number;
  disposedCount: number;
  activeClaims: number;
  returnRate: number;
  categoryStats: { name: string; value: number }[];
}