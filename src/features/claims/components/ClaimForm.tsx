import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateClaimMutation } from '@/features/claims/claimApi';
import { useGetMyLostItemsQuery } from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useStudentVerification } from '../../auth/hooks/useStudentVerification';
import { StudentIdCardModal } from '../../auth/components/StudentIdCardModal';

const claimSchema = z.object({
  lostItemId: z.string().min(1, "Vui lòng chọn bài đăng mất đồ của bạn"),
  title: z.string().min(5, "Tiêu đề quá ngắn"),
  description: z.string().min(10, "Vui lòng mô tả kỹ hơn để Staff xác minh (VD: Số tiền, vết trầy, pass...)"),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

interface ClaimFormProps {
  foundItemId: string;
}

export const ClaimForm = ({ foundItemId }: ClaimFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lấy user để có CampusId
  const user = useAppSelector(selectCurrentUser);

  const { isVerified, isStudent } = useStudentVerification();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [createClaim, { isLoading }] = useCreateClaimMutation();
  const { data: myLostItems = [], isLoading: isLoadingLostItems } = useGetMyLostItemsQuery();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      lostItemId: "",
      title: "",
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ClaimFormValues) => {
    if (isStudent && !isVerified) {
      setIsVerificationModalOpen(true);
      return;
    }

    // Validate cơ bản
    if (!user?.campusId) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không xác định được Campus của bạn. Vui lòng đăng nhập lại.",
      });
      return;
    }

    try {
      const formData = new FormData();

      // Append theo đúng Swagger API spec
      formData.append("FoundItemId", foundItemId);
      formData.append("LostItemId", data.lostItemId);
      formData.append("CampusId", user.campusId.toString());

      if (data.title) {
        formData.append("EvidenceTitle", data.title);
      }

      if (data.description) {
        formData.append("EvidenceDescription", data.description);
      }

      // Thêm ảnh nếu có
      if (selectedImages.length > 0) {
        selectedImages.forEach((file) => {
          formData.append("EvidenceImages", file);
        });
      }

      await createClaim(formData).unwrap();

      toast({
        title: "Gửi yêu cầu thành công!",
        description: "Vui lòng chờ Staff duyệt. Bạn có thể theo dõi trong Lịch sử.",
      });

      navigate('/my-claims');

    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi yêu cầu lúc này.",
      });
    }
  };

  return (
    <>
      <StudentIdCardModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* LostItemId Selection - Required */}
          <FormField
            control={form.control}
            name="lostItemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chọn bài đăng mất đồ của bạn *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingLostItems ? "Đang tải..." : "Chọn bài đăng mất đồ"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingLostItems ? (
                      <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                    ) : myLostItems.length === 0 ? (
                      <SelectItem value="empty" disabled>Bạn chưa có bài đăng mất đồ</SelectItem>
                    ) : (
                      myLostItems.map((item) => (
                        <SelectItem key={item.lostItemId} value={item.lostItemId.toString()}>
                          {item.title} - {item.categoryName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Alert if no lost items */}
          {!isLoadingLostItems && myLostItems.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bạn chưa có bài đăng mất đồ nào. Vui lòng{" "}
                <a href="/report-lost" className="underline font-semibold">đăng báo mất đồ</a> trước khi nhận sở hữu.
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề bằng chứng</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Hóa đơn mua hàng / Ảnh chụp cũ / Đặc điểm bí mật" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả chi tiết (Quan trọng)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Hãy mô tả những đặc điểm..."
                    className="h-32 bg-yellow-50/50 border-yellow-200 focus-visible:ring-yellow-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Upload Ảnh Bằng Chứng */}
          <div className="space-y-2">
            <Label>Hình ảnh xác minh (Nếu có)</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 hover:bg-slate-50 transition-colors">
                <Upload className="h-6 w-6 text-slate-400" />
                <span className="mt-1 text-xs text-slate-500">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {previewUrls.map((url, index) => (
                <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md border">
                  <img src={url} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              Nên upload ảnh cũ bạn đã chụp món đồ này, hoặc ảnh hóa đơn mua hàng.
            </p>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-bold text-md" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            XÁC NHẬN ĐÂY LÀ ĐỒ CỦA TÔI
          </Button>
        </form>
      </Form>
    </>
  );
};