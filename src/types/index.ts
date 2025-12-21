export type UserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN" | "SECURITY OFFICER" | "USER";
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

// Paginated response for FoundItems API
export interface PaginatedFoundItemsResponse {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: FoundItem[];
}

// Temporary Found Item từ Security
export interface TemporaryFoundItem extends FoundItem {
  status: 'Open'; // Temporary items luôn có status Open
  finderName: string;
  finderContact?: string;
  transferredToStaff: boolean;
}

// Extended Claim với thông tin chi tiết hơn cho Security
export interface DisputedClaim extends Claim {
  foundItemDetails?: {
    id: number;
    title: string;
    thumbnail: string;
    foundLocation: string;
    foundDate: string;
  };
  claimantName?: string;
  evidenceDescription?: string;
  disputeReason?: string;
}


export interface User {
  email: string;
  fullName: string;
  role: UserRole;
  campusName: string;
  campusId: number;
  avatarUrl?: string;
}

// System Reports for Admin
export interface SystemReport {
  totalLostItems: number;
  totalFoundItems: number;
  itemsInStorage: number;
  itemsReturned: number;
  itemsClaimed: number;
  itemsOpen: number; // Temporary items from Security
  campusStats: CampusStat[];
}

export interface CampusStat {
  campusID: number;
  campusName: string;
  totalLostItems: number;
  totalFoundItems: number;
  itemsInStorage: number;
  itemsReturned: number;
}

// Extended User for Admin management
export interface AdminUser extends User {
  userId: number;
  isActive: boolean;
}

// Create Campus Request
export interface CreateCampusRequest {
  campusName: string;
  address: string;
  storageLocation: string;
}

// Assign User Request
export interface AssignUserRequest {
  userId: string;
  role: 'STAFF' | 'SECURITY';
  campusId: string;
}

// Type cho API response khi login thành công
export interface LoginResponse {
  user: User;
  token: string;
}

export interface ActionLog {
  actionId: number;
  lostItemId: number | null;
  foundItemId: number | null;
  claimRequestId: number | null;
  actionType: string;
  actionDetails: string;
  oldStatus: string | null;
  newStatus: string | null;
  actionDate: string;
  performedBy: number;
  performedByName: string;
  campusId: number;
  campusName: string;
}

export interface Campus {
  campusId: number;
  campusName: string;
  address: string;
  storageLocation: string;
}

export interface Claim {
  claimId: number
  claimDate: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Conflicted' | 'Returned'
  foundItemId: number | null
  lostItemId: number | null
  foundItemTitle: string | null
  lostItemTitle?: string | null
  priority?: string | null
  studentId: number
  studentName: string | null
  evidences: Evidence[]
  actionLogs: ActionLog[]
  matchId?: number // Match ID for return API
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
export interface MatchedItem {
  matchId: number;
  matchStatus: string;
  createdAt: string;
  status: string;
  lostItemId: number;
  lostItem: LostItem;
  foundItemId: number;
  foundItem: FoundItem;
}

export interface PaginatedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

export interface StaffWorkItems {
  pendingAndConflictedClaims: PaginatedResponse<Claim>;
  matchedItems: PaginatedResponse<MatchedItem>;
}
