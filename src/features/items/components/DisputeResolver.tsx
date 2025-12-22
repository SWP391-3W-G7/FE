import { CheckCircle, ShieldAlert, Gavel, User, FileText, Image as ImageIcon } from 'lucide-react';
import { formatVN } from '@/utils/dateUtils';

// API
import { useGetDisputedItemsQuery, useResolveDisputeMutation } from '@/features/items/itemApi';

// UI Libs
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TYPES (Dựa trên thông tin bạn cung cấp) ---
export interface Evidence {
  evidenceId: number;
  imageUrl?: string;    // Giả định trường này chứa link ảnh
  imageUrls?: string[]; // Array of image URLs
  description?: string; // Giả định trường này chứa mô tả text
}

export interface Claim {
  claimId: number;
  claimDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  foundItemId: number | null;
  lostItemId: number | null;
  foundItemTitle: string | null;
  studentId: number;
  studentName: string | null;
  evidences: Evidence[]; // Mảng bằng chứng
  actionLogs: string;
}

export interface FoundItem {
  foundItemId: number;
  title: string;
  foundDate: string;
  foundLocation: string;
  imageUrls: string[];
  claimRequests: Claim[] | null; // Danh sách claim
  // ... các trường khác
}

export const DisputeResolver = () => {
  const { toast } = useToast();

  // 1. Lấy dữ liệu
  const { data, isLoading } = useGetDisputedItemsQuery();
  const [resolveDispute, { isLoading: isResolving }] = useResolveDisputeMutation();
  
  // Extract items from paginated response
  type ApiClaim = { claimId: number; foundItemId: number; foundItemTitle: string | null; claimDate: string; evidences: unknown[]; studentName: string | null; studentId: number };
  const allClaims: ApiClaim[] = data?.items || [];

  // 2. Nhóm claims theo foundItemId
  const groupedByItem = allClaims.reduce((acc: Record<number, FoundItem>, claim: ApiClaim) => {
    const itemId = claim.foundItemId;
    if (!itemId) return acc;
    
    if (!acc[itemId]) {
      acc[itemId] = {
        foundItemId: itemId,
        title: claim.foundItemTitle || "Unknown Item",
        foundDate: claim.claimDate,
        foundLocation: "N/A",
        imageUrls: [],
        claimRequests: [] as Claim[]
      };
    }
    // Cast API claim to local Claim type
    const localClaim: Claim = {
      claimId: claim.claimId,
      claimDate: claim.claimDate,
      status: 'Pending',
      foundItemId: claim.foundItemId,
      lostItemId: null,
      foundItemTitle: claim.foundItemTitle,
      studentId: claim.studentId,
      studentName: claim.studentName,
      evidences: (claim.evidences || []) as Evidence[],
      actionLogs: ''
    };
    if (acc[itemId].claimRequests) {
      acc[itemId].claimRequests!.push(localClaim);
    }
    return acc;
  }, {});

  // Convert to array with proper type
  const disputedItems = Object.values(groupedByItem);

  const handlePickWinner = async (itemId: number, winnerClaimId: number, winnerName: string) => {
    try {
      await resolveDispute({ itemId, winnerClaimId }).unwrap();
      toast({
        title: "Đã giải quyết tranh chấp!",
        description: `Xác nhận sinh viên ${winnerName} là chủ sở hữu.`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Không thể xử lý tranh chấp lúc này.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) return <div className="py-10 text-center">Đang kiểm tra các tranh chấp...</div>;

  if (disputedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-slate-50">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Không có tranh chấp nào</h3>
        <p className="text-slate-500">Hiện tại không có vật phẩm nào bị nhiều người nhận cùng lúc.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {disputedItems.map((item: FoundItem) => (
        <Card key={item.foundItemId} className="border-orange-200 shadow-md overflow-hidden bg-white">
          {/* Header: Thông tin vật phẩm */}
          <CardHeader className="bg-orange-50 border-b border-orange-100 pb-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex gap-4">
                {/* Ảnh vật phẩm */}
                <div className="h-20 w-20 rounded-md overflow-hidden border border-slate-200 bg-white shrink-0">
                  <img
                    src={item.imageUrls?.[0] || "https://placehold.co/150?text=No+Img"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-orange-800 font-bold text-lg">
                    <ShieldAlert className="w-5 h-5" />
                    TRANH CHẤP: {item.title || "Unknown Item"}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-semibold">Nơi nhặt:</span> {item.foundLocation}
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">Thời gian:</span> {formatVN(item.foundDate)}
                  </div>
                </div>
              </div>
              <Badge variant="destructive" className="h-fit w-fit whitespace-nowrap">
                {item.claimRequests?.length} người đang nhận
              </Badge>
            </div>
          </CardHeader>

          {/* Content: Danh sách người nhận (Claims) */}
          <CardContent className="pt-6 bg-slate-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {item.claimRequests && item.claimRequests.map((claim: Claim) => (
                <div
                  key={claim.claimId}
                  className="flex flex-col border rounded-xl bg-white shadow-sm hover:border-blue-400 transition-all duration-200"
                >
                  <div className="p-5 flex-1">
                    {/* 1. Header Claimer */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 border bg-slate-100">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${claim.studentName}&background=random`} />
                        <AvatarFallback><User className="h-5 w-5 text-slate-400" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900">{claim.studentName || "Sinh viên ẩn danh"}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          MSSV: {claim.studentId}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Claim #{claim.claimId}
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    {/* 2. Phần Bằng chứng (Evidences) */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> BẰNG CHỨNG ĐÃ GỬI:
                      </p>

                      <ScrollArea className="h-[120px] w-full rounded-md border p-2 bg-slate-50">
                        {claim.evidences && claim.evidences.length > 0 ? (
                          <div className="space-y-3">
                            {claim.evidences.map((evidence: Evidence, idx: number) => (
                              <div key={idx} className="text-sm text-slate-700">
                                {/* Trường hợp là Text */}
                                {evidence.description && (
                                  <div className="mb-1 italic">"{evidence.description}"</div>
                                )}
                                {/* Trường hợp là Ảnh */}
                                {evidence.imageUrls?.[0] && (
                                  <div className="relative group mt-2">
                                    <img
                                      src={evidence.imageUrls?.[0]}
                                      alt="Evidence"
                                      className="h-32 w-full object-cover rounded-md border cursor-pointer hover:opacity-90"
                                      onClick={() => window.open(evidence.imageUrls?.[0], '_blank')}
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded flex items-center">
                                      <ImageIcon className="w-3 h-3 mr-1" /> Ảnh minh chứng
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                            <span>Không có bằng chứng đính kèm</span>
                          </div>
                        )}
                      </ScrollArea>

                      <div className="text-[10px] text-slate-400 text-right mt-1">
                        Gửi yêu cầu lúc: {formatVN(claim.claimDate)}
                      </div>
                    </div>
                  </div>

                  {/* 3. Footer Action */}
                  <div className="p-4 bg-slate-50 border-t rounded-b-xl">
                    <Button
                      className="w-full bg-slate-900 hover:bg-green-600 transition-colors"
                      size="sm"
                      onClick={() => handlePickWinner(item.foundItemId, claim.claimId, claim.studentName || "Sinh viên")}
                      disabled={isResolving}
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Xác nhận: Người này đúng
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};