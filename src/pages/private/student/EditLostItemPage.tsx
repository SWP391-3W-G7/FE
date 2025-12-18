import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Upload, X, ChevronLeft } from 'lucide-react';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useGetCategoriesQuery,
  useGetCampusesQuery,
  useGetMyLostItemsQuery,
  useUpdateLostItemMutation
} from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Category, LostItem } from '@/types';

const editLostSchema = z.object({
  title: z.string().min(5, "Tiêu đề quá ngắn (tối thiểu 5 ký tự)"),
  description: z.string().min(10, "Vui lòng mô tả chi tiết hơn"),
  categoryId: z.string("Vui lòng chọn loại tài sản"),
  campusId: z.string("Vui lòng chọn cơ sở"),
  lostDate: z.date("Vui lòng chọn ngày mất"),
  lostLocation: z.string().min(2, "Vui lòng nhập vị trí ước lượng"),
});

type EditLostFormValues = z.infer<typeof editLostSchema>;

const EditLostItemPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get all lost items and find the one we need
  const { data: lostItems, isLoading: loadingItems } = useGetMyLostItemsQuery();
  const item = lostItems?.find((i: LostItem) => i.lostItemId.toString() === id);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: campuses = [] } = useGetCampusesQuery();
  const [updateLostItem, { isLoading: updating }] = useUpdateLostItemMutation();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<EditLostFormValues>({
    resolver: zodResolver(editLostSchema),
    defaultValues: {},
  });

  // Populate form when item data loads
  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description || "",
        categoryId: item.categoryId?.toString(),
        campusId: item.campusId?.toString(),
        lostDate: new Date(item.lostDate),
        lostLocation: item.lostLocation,
      });
      setExistingImages(item.imageUrls || []);
    }
  }, [item, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditLostFormValues) => {
    if (!id) return;

    try {
      const formData = new FormData();
      formData.append("Title", data.title);
      formData.append("Description", data.description);
      formData.append("CategoryId", data.categoryId);
      formData.append("CampusId", data.campusId);
      formData.append("LostDate", data.lostDate.toISOString());
      formData.append("LostLocation", data.lostLocation);

      // Add new images
      selectedImages.forEach((file) => {
        formData.append("Images", file);
      });

      // Keep existing images
      existingImages.forEach((url) => {
        formData.append("ExistingImageUrls", url);
      });

      await updateLostItem({ id: parseInt(id), formData }).unwrap();

      toast({
        title: "Cập nhật thành công!",
        description: "Tin báo mất đã được chỉnh sửa.",
      });

      navigate('/my-claims');
    } catch (error) {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật tin báo. Vui lòng thử lại.",
      });
    }
  };

  if (loadingItems) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-slate-500">Không tìm thấy tin báo này.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-orange-600"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chỉnh sửa tin báo mất</h1>
          <p className="text-slate-500 mt-2">Cập nhật thông tin tài sản bị mất của bạn.</p>
        </div>

        <Card className="border-slate-200 shadow-sm border-t-4 border-t-orange-600">
          <CardHeader>
            <CardTitle>Thông tin tài sản</CardTitle>
            <CardDescription>Chỉnh sửa các thông tin bên dưới.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên tài sản bị mất <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Ví da màu đen, Laptop Dell..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại tài sản <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat: Category) => (
                              <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                                {cat.categoryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả đặc điểm nhận dạng: Màu sắc, nhãn hiệu, vết trầy xước, nội dung bên trong..."
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Cung cấp càng nhiều chi tiết càng dễ tìm lại.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lostDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Thời gian mất (Ước lượng) <span className="text-red-500">*</span></FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "dd/MM/yyyy HH:mm") : <span>Chọn ngày giờ</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  const currentValue = field.value;
                                  if (currentValue) {
                                    date.setHours(currentValue.getHours());
                                    date.setMinutes(currentValue.getMinutes());
                                  }
                                  field.onChange(date);
                                }
                              }}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                              locale={vi}
                            />
                            <div className="border-t p-3 flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Giờ:</span>
                              <Input
                                type="number"
                                min={0}
                                max={23}
                                placeholder="HH"
                                className="w-16 text-center"
                                value={field.value ? field.value.getHours() : ""}
                                onChange={(e) => {
                                  const hours = parseInt(e.target.value) || 0;
                                  const date = field.value ? new Date(field.value) : new Date();
                                  date.setHours(Math.min(23, Math.max(0, hours)));
                                  field.onChange(date);
                                }}
                              />
                              <span>:</span>
                              <Input
                                type="number"
                                min={0}
                                max={59}
                                placeholder="MM"
                                className="w-16 text-center"
                                value={field.value ? field.value.getMinutes() : ""}
                                onChange={(e) => {
                                  const minutes = parseInt(e.target.value) || 0;
                                  const date = field.value ? new Date(field.value) : new Date();
                                  date.setMinutes(Math.min(59, Math.max(0, minutes)));
                                  field.onChange(date);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="campusId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cơ sở (Campus) <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn Campus" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {campuses.map((campus) => (
                              <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                                {campus.address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lostLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khu vực thất lạc <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Phòng 204 Beta, Canteen, Nhà xe..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images Section */}
                <div className="space-y-2">
                  <Label>Hình ảnh minh họa</Label>
                  <div className="flex flex-wrap gap-4">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative h-24 w-24 overflow-hidden rounded-md border">
                        <img src={url} alt="Existing" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* New Images */}
                    {previewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative h-24 w-24 overflow-hidden rounded-md border border-orange-300">
                        <img src={url} alt="New" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* Upload button */}
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 hover:bg-slate-50 transition-colors">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="mt-1 text-xs text-slate-500">Thêm ảnh</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Tải lên ảnh cũ của đồ vật hoặc ảnh mô tả tương tự.
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={updating}>
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lưu thay đổi
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditLostItemPage;
