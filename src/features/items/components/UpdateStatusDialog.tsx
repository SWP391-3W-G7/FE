import { useState } from 'react';
import { useUpdateFoundItemStatusMutation } from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UpdateStatusDialogProps {
  foundItemId: string;
  currentStatus: string;
  onUpdateSuccess?: () => void;
}

const UpdateStatusDialog = ({ foundItemId, currentStatus, onUpdateSuccess }: UpdateStatusDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const { toast } = useToast();

  const [updateStatus, { isLoading }] = useUpdateFoundItemStatusMutation();

  const getAvailableStatuses = (current: string) => {
    switch (current) {
      case 'Unclaimed':
        return ['Stored'];
      case 'Stored':
        return ['Claimed', 'Returned'];
      case 'Claimed':
        return ['Returned'];
      case 'Returned':
        return []; // Can't change from Returned
      default:
        return ['Stored', 'Claimed', 'Returned'];
    }
  };

  const availableStatuses = getAvailableStatuses(currentStatus);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Stored':
        return 'Đã lưu kho';
      case 'Claimed':
        return 'Đã được nhận';
      case 'Returned':
        return 'Đã trả về';
      case 'Unclaimed':
        return 'Chưa lưu kho';
      default:
        return status;
    }
  };

  const handleSubmit = async () => {
    if (selectedStatus === currentStatus) {
      setOpen(false);
      return;
    }

    try {
      await updateStatus({
        foundItemId,
        status: selectedStatus,
      }).unwrap();

      toast({
        title: "Cập nhật thành công!",
        description: `Trạng thái đã được cập nhật thành "${getStatusLabel(selectedStatus)}"`,
      });

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái lúc này.",
      });
    }
  };

  if (availableStatuses.length === 0) {
    return null; // Don't show button if no available statuses
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Edit className="h-3 w-3 mr-1" />
          Cập nhật
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
          <DialogDescription>
            Thay đổi trạng thái của đồ vật. Trạng thái hiện tại: <strong>{getStatusLabel(currentStatus)}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái mới" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedStatus === currentStatus}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;

