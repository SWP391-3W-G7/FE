import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Upload, X, ChevronLeft } from 'lucide-react';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useGetCategoriesQuery, useGetCampusesQuery, useCreateTemporaryFoundItemMutation } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const temporaryFoundItemSchema = z.object({
    title: z.string().min(5, "Vui lòng nhập tên đồ vật rõ ràng"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Chọn loại tài sản"),
    campusId: z.string().min(1, "Chọn cơ sở"),
    foundDate: z.date({ required_error: "Chọn thời gian nhặt" }),
    foundLocation: z.string().min(2, "Nhập vị trí nhặt được"),
});

type TemporaryFoundItemFormValues = z.infer<typeof temporaryFoundItemSchema>;

const SecurityLogPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = useAppSelector(selectCurrentUser);

    const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
    const { data: campuses = [] } = useGetCampusesQuery();
    const [createTemporaryItem, { isLoading }] = useCreateTemporaryFoundItemMutation();

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const form = useForm<TemporaryFoundItemFormValues>({
        resolver: zodResolver(temporaryFoundItemSchema),
        defaultValues: {
            campusId: user?.campusId?.toString() || "",
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

    const onSubmit = async (data: TemporaryFoundItemFormValues) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            if (data.description) {
                formData.append("description", data.description);
            }
            formData.append("categoryId", data.categoryId);
            formData.append("campusId", data.campusId);
            
            // Format date as local datetime string (yyyy-MM-ddTHH:mm:ss)
            const year = data.foundDate.getFullYear();
            const month = String(data.foundDate.getMonth() + 1).padStart(2, '0');
            const day = String(data.foundDate.getDate()).padStart(2, '0');
            const hours = String(data.foundDate.getHours()).padStart(2, '0');
            const minutes = String(data.foundDate.getMinutes()).padStart(2, '0');
            const seconds = String(data.foundDate.getSeconds()).padStart(2, '0');
            const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            
            formData.append("foundDate", localDateTimeString);
            formData.append("foundLocation", data.foundLocation);

            selectedImages.forEach((file) => {
                formData.append("images", file);
            });

            await createTemporaryItem(formData).unwrap();

            toast({
                title: "Đã ghi nhận tạm thời!",
                description: "Vật phẩm đã được ghi nhận với trạng thái 'Open'. Vui lòng chuyển giao đến DVSV Staff.",
            });

            form.reset();
            setSelectedImages([]);
            setPreviewUrls([]);

        } catch (error) {
            console.error("Submit error:", error);
            toast({
                variant: "destructive",
                title: "Lỗi hệ thống",
                description: "Không thể ghi nhận lúc này.",
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ghi nhận tạm thời đồ nhặt được</h1>
                    <p className="text-slate-500 mt-2">
                        Ghi nhận thông tin khi có người giao nộp đồ vật nhặt được. Sau đó bàn giao cho phòng DVSV để tạo hồ sơ chính thức.
                    </p>
                </div>

                <Card className="border-slate-200 shadow-sm border-t-4 border-t-blue-600">
                    <CardHeader>
                        <CardTitle>Thông tin đồ vật và người giao nộp</CardTitle>
                        <CardDescription>
                            Điền đầy đủ thông tin để DVSV có thể xử lý tiếp.
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
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn loại" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingCategories ? (
                                                            <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                                                        ) : (
                                                            categories
                                                                .filter((cat) => cat && cat.categoryId != null)
                                                                .map((cat) => (
                                                                    <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                                                                        {cat.categoryName || 'Chưa có tên'}
                                                                    </SelectItem>
                                                                ))
                                                        )}
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
                                                        <div className="p-3 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="time"
                                                                    value={field.value ? format(field.value, "HH:mm") : "00:00"}
                                                                    onChange={(e) => {
                                                                        const [hours, minutes] = e.target.value.split(':');
                                                                        const newDate = field.value ? new Date(field.value) : new Date();
                                                                        newDate.setHours(parseInt(hours), parseInt(minutes));
                                                                        field.onChange(newDate);
                                                                    }}
                                                                    className="w-full"
                                                                />
                                                            </div>
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
                                                        <SelectTrigger><SelectValue placeholder="Chọn Campus" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {campuses.map((campus) => (
                                                            <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                                                                {campus.campusName}
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
                                        Chụp rõ nét để DVSV dễ nhận diện.
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                                    ⚠️ Lưu ý: Sau khi ghi nhận, vui lòng bàn giao đồ vật cho phòng DVSV để tạo hồ sơ chính thức và lưu kho.
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Ghi nhận tạm thời
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

export default SecurityLogPage;

