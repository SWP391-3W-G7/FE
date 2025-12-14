export type UserRole = 'STUDENT' | 'STAFF' | 'SECURITY'| 'ADMIN';

export type ItemStatus = 'PENDING' | 'VERIFIED' | 'RETURNED' | 'REJECTED';

// ==========================================
// MAP THEO DATABASE TABLES
// ==========================================

// Table Role
export interface Role {
  roleID: number;
  roleName: string; // 'Student', 'Staff', 'Admin'
}

// Table Campus
export interface Campus {
  campusID: number;
  campusName: string;      // VD: HCM - NVH
  address: string;
  storageLocation: string; // VD: Phòng P.102
}

// Table Category
export interface Category {
  categoryID: number;
  categoryName: string; // VD: Ví, Laptop
}

export interface LostItem {
  lostItemID: number;
  title: string;       // DB ông thiếu cột này, nhưng ở Prompt trước đã chốt thêm vào
  description: string; // DB ông thiếu cột này, nhưng ở Prompt trước đã chốt thêm vào
  lostDate: string;    // datetime ISO
  lostLocation: string;
  status: 'Open' | 'Closed' | 'Found';
  createdBy: number;
  categoryID: number;
  campusID: number; // Mapping từ logic Business
}

export interface CreateLostItemRequest {
  title: string;
  description: string;
  lostDate: string;
  lostLocation: string;
  campusID: number;
  categoryID: number;
}



export interface Claim {
  claimID: number;
  claimDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  // Join với FoundItem để hiển thị thông tin món đồ đang claim
  foundItem: {
    id: number;
    title: string;
    thumbnail: string;
  };
}


// Table Image (Ảnh tách riêng)
export interface Image {
  imageID: number;
  imageURL: string;
  uploadedAt: string;
  uploadedBy: number;
  lostItemID?: number | null;
  foundItemID?: number | null; // Link tới FoundItem
  evidenceID?: number | null;
}

// DTO (Data Transfer Object) - Dùng cho Frontend hiển thị
// (Đây là object sau khi đã JOIN các bảng lại)
export interface FoundItemDisplayDTO extends FoundItem {
  campusName: string;
  categoryName: string;
  thumbnailURL: string; // Lấy ảnh đầu tiên từ bảng Image
}
// Table FoundItem (Đồ nhặt được)
export interface FoundItem {
  foundItemID: number;
  title: string;
  description: string;
  foundDate: string; // datetime ISO string
  foundLocation: string;
  status: 'Stored' | 'Returned' | 'Unclaimed' | 'Claimed' | 'Open'; // Map từ varchar DB - 'Open' là temporary từ Security
  createdBy?: number; // UserID
  storedBy?: number;  // UserID (Staff)
  campusID: number;  // FK -> Campus
  categoryID: number;// FK -> Category
  storageLocation?: string; // Vị trí lưu trữ trong kho (VD: Kệ A, Tủ số 5)
  finderName?: string; // Tên người nhặt được (từ Security)
  finderContact?: string; // SĐT người nhặt được
  transferredToStaff?: boolean; // Đã chuyển đến Staff chưa
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
  foundItem: {
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
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  campusId?: string; 
  avatarUrl?: string;
}

// Type cho API response khi login thành công
export interface LoginResponse {
  user: User;
  token: string;
}