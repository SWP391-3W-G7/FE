import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Upload, X } from 'lucide-react';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useGetCategoriesQuery, useGetCampusesQuery, useCreateFoundItemMutation } from '../../items/itemApi';
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const foundReportSchema = z.object({
    title: z.string().min(5, "Vui lòng nhập tên đồ vật rõ ràng"),
    description: z.string().min(2, "Mô tả ngắn gọn về tình trạng đồ"),
    categoryId: z.string("Chọn loại tài sản"),
    campusId: z.string("Chọn cơ sở nhặt được"),
    foundDate: z.date("Chọn thời gian nhặt"),
    foundLocation: z.string().min(2, "Nhập vị trí nhặt được"),
});

type FoundReportFormValues = z.infer<typeof foundReportSchema>;

export const ReportFoundForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = useAppSelector(selectCurrentUser);

    const { data: categories = [] } = useGetCategoriesQuery();
    const { data: campuses = [] } = useGetCampusesQuery();
    const [createFoundItem, { isLoading }] = useCreateFoundItemMutation();

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const form = useForm<FoundReportFormValues>({
        resolver: zodResolver(foundReportSchema),
        defaultValues: {},
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

    const onSubmit = async (data: FoundReportFormValues) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("categoryId", data.categoryId);
            formData.append("campusId", data.campusId);
            formData.append("foundDate", data.foundDate.toISOString());
            formData.append("foundLocation", data.foundLocation);

            selectedImages.forEach((file) => {
                formData.append("images", file);
            });

            await createFoundItem(formData).unwrap();

            toast({
                title: "Cảm ơn bạn!",
                description: "Thông tin đã được gửi. Vui lòng bàn giao đồ cho phòng DVSV sớm nhất có thể.",
            });

            navigate('/items');

        } catch (error) {
            console.error("Submit error:", error);
            toast({
                variant: "destructive",
                title: "Lỗi hệ thống",
                description: "Không thể gửi báo cáo lúc này.",
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên đồ vật nhặt được <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: Chìa khóa xe, Thẻ sinh viên..." {...field} />
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
                            <FormLabel>Mô tả tình trạng <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Mô tả màu sắc, hiện trạng (cũ/mới), các đặc điểm nhận dạng bên ngoài..."
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Chọn Campus" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {campuses.map((campus) => (
                                            <SelectItem key={campus.id} value={campus.id.toString()}>
                                                {campus.description}
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
                        Chụp rõ nét để người mất dễ nhận diện.
                    </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gửi thông tin
                    </Button>
                </div>

            </form>
        </Form>
    );
};