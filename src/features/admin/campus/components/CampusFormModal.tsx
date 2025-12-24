import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Campus } from '@/types';
import { useEffect } from 'react';

const campusSchema = z.object({
    campusName: z.string().min(3, "Tên campus phải có ít nhất 3 ký tự"),
    address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
    storageLocation: z.string().min(2, "Vị trí lưu trữ phải có ít nhất 2 ký tự"),
});

export type CampusFormValues = z.infer<typeof campusSchema>;

interface CampusFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CampusFormValues) => Promise<void>;
    initialData?: Campus | null;
    isLoading?: boolean;
}

export const CampusFormModal = ({
    isOpen,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}: CampusFormModalProps) => {
    const form = useForm<CampusFormValues>({
        resolver: zodResolver(campusSchema),
        defaultValues: {
            campusName: "",
            address: "",
            storageLocation: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                campusName: initialData.campusName,
                address: initialData.address,
                storageLocation: initialData.storageLocation,
            });
        } else {
            form.reset({
                campusName: "",
                address: "",
                storageLocation: "",
            });
        }
    }, [initialData, form, isOpen]);

    const handleSubmit = async (data: CampusFormValues) => {
        await onSubmit(data);
        if (!isLoading) {
            form.reset();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Sửa thông tin Campus" : "Thêm Campus mới"}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? `Cập nhật thông tin cho cơ sở ${initialData.campusName}`
                            : "Điền thông tin để thêm một cơ sở mới vào hệ thống quản lý."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 py-2">
                        <FormField
                            control={form.control}
                            name="campusName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-xs uppercase">Tên Campus <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: HCM - Quận 9" {...field} className="h-10 border-slate-200 focus:border-indigo-500" />
                                    </FormControl>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-xs uppercase">Địa chỉ <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập địa chỉ đầy đủ của campus..."
                                            className="resize-none border-slate-200 focus:border-indigo-500"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="storageLocation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-xs uppercase">Vị trí lưu trữ <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: Phòng P.102, Tòa Alpha" {...field} className="h-10 border-slate-200 focus:border-indigo-500" />
                                    </FormControl>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                className="text-slate-500 hover:bg-slate-100"
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 min-w-[120px]">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Cập nhật" : "Tạo Campus"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
