import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Clock, FileText, Send, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useGetDisputedClaimsQuery, useAddInvestigationNotesMutation } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const SecurityDisputePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAppSelector(selectCurrentUser);

  const [keyword, setKeyword] = useState<string>("");
  const [selectedCampus, setSelectedCampus] = useState<string>(user?.campusId || "all");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [investigationNotes, setInvestigationNotes] = useState<string>("");

  const { data: claims = [], isLoading, refetch } = useGetDisputedClaimsQuery({
    campusId: selectedCampus === "all" ? undefined : selectedCampus,
  });

  const [addNotes, { isLoading: isAddingNotes }] = useAddInvestigationNotesMutation();

  // Filter by keyword
  const filteredClaims = keyword.trim()
    ? claims.filter(claim =>
        claim.foundItem.title.toLowerCase().includes(keyword.toLowerCase()) ||
        (claim.claimantName && claim.claimantName.toLowerCase().includes(keyword.toLowerCase())) ||
        (claim.disputeReason && claim.disputeReason.toLowerCase().includes(keyword.toLowerCase()))
      )
    : claims;

  const handleOpenNotesDialog = (claimId: string) => {
    setSelectedClaimId(claimId);
    setInvestigationNotes("");
    setNotesDialogOpen(true);
  };

  const handleAddNotes = async () => {
    if (!selectedClaimId || !investigationNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập ghi chú điều tra.",
      });
      return;
    }

    try {
      await addNotes({
        claimId: selectedClaimId,
        notes: investigationNotes,
      }).unwrap();

      toast({
        title: "Đã ghi nhận!",
        description: "Ghi chú điều tra đã được lưu và gửi đến Staff.",
      });

      setNotesDialogOpen(false);
      setSelectedClaimId(null);
      setInvestigationNotes("");
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lưu ghi chú.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Đang chờ</Badge>;
      case 'Approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Đã duyệt</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Đã từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Điều tra tranh chấp</h1>
        <p className="text-slate-500 mt-1">
          Hỗ trợ điều tra và ghi chú cho các vụ tranh chấp claim phức tạp. Làm việc với Staff để giải quyết.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên đồ vật, người claim, lý do tranh chấp..."
              className="pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <SelectValue placeholder="Campus" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Campus</SelectItem>
                <SelectItem value="hcm-nvh">HCM - NVH Sinh Viên</SelectItem>
                <SelectItem value="hcm-shtp">HCM - SHTP (Q9)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1">
            <Button
              variant="ghost"
              className="w-full text-xs text-slate-500"
              onClick={() => {
                setKeyword("");
                setSelectedCampus("all");
              }}
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredClaims.length > 0 ? (
        <div className="space-y-6">
          {filteredClaims.map((claim) => (
            <Card key={claim.claimID} className="border-orange-200 bg-orange-50/30">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Found Item Image */}
                  <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    <AspectRatio ratio={1}>
                      <img
                        src={claim.foundItem.thumbnail}
                        alt={claim.foundItem.title}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>

                  {/* Claim Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                          {claim.foundItem.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(claim.status)}
                          <Badge variant="outline" className="border-orange-300 text-orange-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Tranh chấp
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>Claim ID: #{claim.claimID}</p>
                        <p>{format(new Date(claim.claimDate), "dd/MM/yyyy HH:mm")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-700">Vị trí nhặt được:</p>
                          <p className="text-slate-600">{claim.foundItem.foundLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-700">Thời gian nhặt:</p>
                          <p className="text-slate-600">
                            {format(new Date(claim.foundItem.foundDate), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {claim.claimantName && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-700">Người yêu cầu:</p>
                        <p className="text-sm text-slate-600">{claim.claimantName}</p>
                      </div>
                    )}

                    {claim.evidenceDescription && (
                      <div className="mb-3 p-3 bg-white rounded-md border border-slate-200">
                        <p className="text-xs font-medium text-slate-700 mb-1">Bằng chứng:</p>
                        <p className="text-xs text-slate-600">{claim.evidenceDescription}</p>
                      </div>
                    )}

                    {claim.disputeReason && (
                      <div className="mb-3 p-3 bg-orange-100 rounded-md border border-orange-200">
                        <p className="text-xs font-medium text-orange-800 mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Lý do tranh chấp:
                        </p>
                        <p className="text-xs text-orange-700">{claim.disputeReason}</p>
                      </div>
                    )}

                    <Separator className="my-3" />

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenNotesDialog(claim.claimID.toString())}
                        className="bg-white"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Thêm ghi chú điều tra
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-medium text-slate-900">Không có tranh chấp nào</h3>
          <p className="text-slate-500 mt-2 max-w-sm text-center">
            Hiện tại không có vụ tranh chấp claim nào cần điều tra.
          </p>
        </div>
      )}

      {/* Investigation Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm ghi chú điều tra</DialogTitle>
            <DialogDescription>
              Ghi chú chi tiết về kết quả điều tra, bằng chứng, nhân chứng, hoặc bất kỳ thông tin nào có thể giúp Staff quyết định.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Ghi chú điều tra</Label>
            <Textarea
              placeholder="VD: Đã kiểm tra camera tại vị trí nhặt được, có nhân chứng xác nhận thời gian, so sánh với báo cáo mất đồ..."
              value={investigationNotes}
              onChange={(e) => setInvestigationNotes(e.target.value)}
              className="mt-2"
              rows={6}
            />
            <p className="text-xs text-slate-500 mt-2">
              Ghi chú này sẽ được gửi đến Staff và được lưu vào hồ sơ điều tra.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNotesDialogOpen(false);
                setInvestigationNotes("");
              }}
              disabled={isAddingNotes}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddNotes}
              disabled={isAddingNotes || !investigationNotes.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAddingNotes ? "Đang lưu..." : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi đến Staff
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityDisputePage;

