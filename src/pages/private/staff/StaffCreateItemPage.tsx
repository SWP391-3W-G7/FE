import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Upload, X, ChevronLeft } from 'lucide-react';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useGetCategoriesQuery, useCreateOfficialFoundItemMutation } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const officialFoundItemSchema = z.object({
    title: z.string().min(5, "Vui lòng nhập tên đồ vật rõ ràng"),
    description: z.string().min(2, "Mô tả ngắn gọn về tình trạng đồ"),
    categoryId: z.string("Chọn loại tài sản"),
    campusId: z.string("Chọn cơ sở"),
    foundDate: z.date("Chọn thời gian nhặt"),
    foundLocation: z.string().min(2, "Nhập vị trí nhặt được"),
    storageLocation: z.string().min(2, "Nhập vị trí lưu trữ trong kho"),
});

type OfficialFoundItemFormValues = z.infer<typeof officialFoundItemSchema>;

const StaffCreateItemPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = useAppSelector(selectCurrentUser);

    const { data: categories = [] } = useGetCategoriesQuery();
    const [createOfficialItem, { isLoading }] = useCreateOfficialFoundItemMutation();

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const form = useForm<OfficialFoundItemFormValues>({
        resolver: zodResolver(officialFoundItemSchema),
        defaultValues: {
            campusId: user?.campusId || "hcm-nvh",
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

    const onSubmit = async (data: OfficialFoundItemFormValues) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("categoryId", data.categoryId);
            formData.append("campusId", data.campusId);
            formData.append("foundDate", data.foundDate.toISOString());
            formData.append("foundLocation", data.foundLocation);
            formData.append("storageLocation", data.storageLocation);
            // Status will be set to "Stored" by default on backend

            selectedImages.forEach((file) => {
                formData.append("images", file);
            });

            await createOfficialItem(formData).unwrap();

            toast({
                title: "Tạo hồ sơ thành công!",
                description: "Đồ vật đã được ghi nhận và lưu kho. Trạng thái: Đã lưu kho (Stored).",
            });

            navigate(window.location.pathname.includes('/test/') ? '/test/staff/dashboard' : '/staff/dashboard');

        } catch (error) {
            console.error("Submit error:", error);
            toast({
                variant: "destructive",
                title: "Lỗi hệ thống",
                description: "Không thể tạo hồ sơ lúc này.",
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Button 
                variant="ghost" 
                className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600"
                onClick={() => navigate(-1)}
            >
                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tạo hồ sơ đồ nhặt được chính thức</h1>
                    <p className="text-slate-500 mt-2">
                        Tạo hồ sơ chính thức cho đồ vật đã được nhặt và lưu trữ trong kho. Hồ sơ này sẽ được công khai để sinh viên có thể tìm kiếm.
                    </p>
                </div>

                <Card className="border-slate-200 shadow-sm border-t-4 border-t-green-600">
                    <CardHeader>
                        <CardTitle>Thông tin đồ vật và vị trí lưu trữ</CardTitle>
                        <CardDescription>
                            Điền đầy đủ thông tin để tạo hồ sơ chính thức. Đồ vật sẽ được đánh dấu "Đã lưu kho".
                        </CardDescription>
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
                                                <FormLabel>Tên đồ vật <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: Ví da, Chìa khóa xe..." {...field} />
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn loại" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.categoryID} value={cat.categoryID.toString()}>
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
                                            <FormLabel>Mô tả tình trạng <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Mô tả màu sắc, hiện trạng, các đặc điểm nhận dạng..."
                                                    className="h-24"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="foundDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Thời gian nhặt được <span className="text-red-500">*</span></FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                                {field.value ? format(field.value, "dd/MM/yyyy HH:mm", { locale: vi }) : <span>Chọn ngày giờ</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                            initialFocus
                                                            locale={vi}
                                                        />
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Chọn Campus" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="hcm-nvh">HCM - NVH Sinh Viên</SelectItem>
                                                        <SelectItem value="hcm-shtp">HCM - SHTP (Q9)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="foundLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vị trí nhặt được <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="VD: Bàn số 5 Canteen, Ghế đá sảnh Alpha..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="border-t pt-6 space-y-4">
                                    <h3 className="font-semibold text-slate-900">Thông tin lưu trữ</h3>
                                    
                                    <FormField
                                        control={form.control}
                                        name="storageLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Vị trí lưu trữ trong kho <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: Kệ A tầng 1, Tủ số 5, Ngăn B3..." {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Ghi rõ vị trí trong kho để dễ dàng tìm lại khi sinh viên đến nhận.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Ảnh chụp vật phẩm (Nếu có)</Label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 hover:bg-slate-50 transition-colors">
                                            <Upload className="h-6 w-6 text-slate-400" />
                                            <span className="mt-1 text-xs text-slate-500">Thêm ảnh</span>
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
                                        Chụp rõ nét để sinh viên dễ nhận diện.
                                    </p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-md text-sm text-green-700">
                                    ✓ Đồ vật sẽ được đánh dấu trạng thái "Đã lưu kho" và hiển thị công khai để sinh viên có thể tìm kiếm và yêu cầu nhận lại.
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Tạo hồ sơ chính thức
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

export default StaffCreateItemPage;

