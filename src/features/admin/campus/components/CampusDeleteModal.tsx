import { Loader2, AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Campus } from '@/types';

interface CampusDeleteModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    campus: Campus | null;
    isLoading?: boolean;
}

export const CampusDeleteModal = ({
    isOpen,
    onOpenChange,
    onConfirm,
    campus,
    isLoading
}: CampusDeleteModalProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[400px]">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2 text-red-600 font-bold">
                        <div className="p-2 bg-red-50 rounded-full">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <AlertDialogTitle className="text-lg">Xác nhận xóa</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-slate-600 py-2">
                        Bạn có chắc chắn muốn xóa cơ sở <strong>{campus?.campusName}</strong>?
                        Tất cả dữ liệu liên quan sẽ bị ảnh hưởng.
                        <p className="mt-3 font-semibold text-red-500 text-xs italic">
                            * Hành động này không thể hoàn tác!
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-4 border-t gap-2">
                    <AlertDialogCancel disabled={isLoading} className="mt-0 border-slate-200">
                        Hủy bỏ
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-900/10"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xác nhận xóa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
