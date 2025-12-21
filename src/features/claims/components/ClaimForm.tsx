import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateClaimMutation } from '@/features/claims/claimApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';

const claimSchema = z.object({
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

  const [createClaim, { isLoading }] = useCreateClaimMutation();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
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

      // --- SỬA CÁC KEY CHO KHỚP API ---

      // 1. FoundItemId (Backend: int32)
      formData.append("FoundItemId", foundItemId);

      // 2. EvidenceTitle (Backend: string)
      formData.append("EvidenceTitle", data.title);

      // 3. EvidenceDescription (Backend: string)
      formData.append("EvidenceDescription", data.description);

      // 4. CampusId (Backend: int32 - Bắt buộc)
      formData.append("CampusId", user.campusId.toString());

      // 5. EvidenceImages (Backend: array file)
      // Lưu ý: Key phải là "EvidenceImages" chứ không phải "images"
      if (selectedImages.length > 0) {
        selectedImages.forEach((file) => {
          formData.append("EvidenceImages", file);
        });
      } else {
        // Nếu backend yêu cầu array nhưng không có file, có thể cần xử lý tùy backend
        // Nhưng thường multipart/form-data bỏ qua cũng được nếu optional
        // Nếu bắt buộc array rỗng thì backend thường tự handle
      }

      await createClaim(formData).unwrap();

      toast({
        title: "Gửi yêu cầu thành công!",
        description: "Vui lòng chờ Staff duyệt. Bạn có thể theo dõi trong Lịch sử.",
      });

      navigate('/my-claims');

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi yêu cầu lúc này.",
      });
    }
  };

  return (
    <Form {...form}>
      {/* ... Phần giao diện giữ nguyên ... */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
  );
};