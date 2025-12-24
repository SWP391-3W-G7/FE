import React, { useState } from 'react';
import { useUploadStudentIdCardMutation } from '../authApi';
import { useAppDispatch } from '@/store';
import { updateUser } from '../authSlice';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StudentIdCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const { toast } = useToast();
    const dispatch = useAppDispatch();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadStudentIdCard, { isLoading }] = useUploadStudentIdCardMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('studentIdCard', file);

            // Mocking for now if API might not return URL, but assuming it updates DB
            // Typically we'd call getProfile again or expect API to return data
            await uploadStudentIdCard(formData).unwrap();

            // For now, let's manually update the state to "verified" by setting a dummy URL if needed
            // Ideally, the backend should return the URL or the app should refetch profile
            dispatch(updateUser({ studentIdCardUrl: 'uploaded' }));

            toast({
                title: "Tải lên thành công",
                description: "Thẻ sinh viên của bạn đã được ghi nhận.",
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
            toast({
                variant: "destructive",
                title: "Tải lên thất bại",
                description: "Vui lòng thử lại sau.",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Xác thực sinh viên</DialogTitle>
                    <DialogDescription>
                        Bạn cần tải lên thẻ sinh viên để thực hiện hành động này.
                        Điều này giúp bảo mật và đảm bảo tính minh bạch cho hệ thống.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive" className="bg-orange-50 text-orange-800 border-orange-200">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertTitle>Yêu cầu bắt buộc</AlertTitle>
                    <AlertDescription>
                        Sinh viên phải có thẻ được xác thực trước khi Báo mất/Báo tìm hoặc Gửi yêu cầu nhận đồ.
                    </AlertDescription>
                </Alert>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center justify-center gap-4">
                        {previewUrl ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                                <img src={previewUrl} alt="ID Card Preview" className="w-full h-full object-cover" />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute bottom-2 right-2"
                                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                                    disabled={isLoading}
                                >
                                    Thay đổi
                                </Button>
                            </div>
                        ) : (
                            <Label
                                htmlFor="id-card-upload"
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                                <span className="text-sm font-medium">Nhấn để tải lên ảnh thẻ</span>
                                <span className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</span>
                            </Label>
                        )}
                        <Input
                            id="id-card-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Bỏ qua</Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tải lên xác thực
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
