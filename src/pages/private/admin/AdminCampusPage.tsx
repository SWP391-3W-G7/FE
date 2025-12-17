import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, MapPin, Building2, Loader2, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { useGetCampusesQuery, useCreateCampusMutation, useUpdateCampusMutation, useDeleteCampusMutation } from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";
import AdminNav from '@/components/AdminNav';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const campusSchema = z.object({
  campusName: z.string().min(3, "Tên campus phải có ít nhất 3 ký tự"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  storageLocation: z.string().min(2, "Vị trí lưu trữ phải có ít nhất 2 ký tự"),
});

type CampusFormValues = z.infer<typeof campusSchema>;
type SortField = 'name' | 'id' | 'storage';
type SortOrder = 'asc' | 'desc';

const AdminCampusPage = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const { data: campuses = [], isLoading, refetch } = useGetCampusesQuery();
  const [createCampus, { isLoading: isCreating }] = useCreateCampusMutation();
  const [updateCampus, { isLoading: isUpdating }] = useUpdateCampusMutation();
  const [deleteCampus, { isLoading: isDeleting }] = useDeleteCampusMutation();

  const form = useForm<CampusFormValues>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      campusName: "",
      address: "",
      storageLocation: "",
    },
  });

  const editForm = useForm<CampusFormValues>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      campusName: "",
      address: "",
      storageLocation: "",
    },
  });

  const onSubmit = async (data: CampusFormValues) => {
    try {
      await createCampus(data).unwrap();

      toast({
        title: "Tạo campus thành công!",
        description: `Campus "${data.campusName}" đã được thêm vào hệ thống.`,
      });

      form.reset();
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo campus lúc này.",
      });
    }
  };

  const handleOpenEditDialog = (campus: any) => {
    setSelectedCampus(campus);
    editForm.reset({
      campusName: campus.campusName,
      address: campus.address,
      storageLocation: campus.storageLocation,
    });
    setEditDialogOpen(true);
  };

  const onEditSubmit = async (data: CampusFormValues) => {
    if (!selectedCampus) return;

    try {
      await updateCampus({
        id: selectedCampus.campusID,
        ...data,
      }).unwrap();

      toast({
        title: "Cập nhật thành công!",
        description: `Campus "${data.campusName}" đã được cập nhật.`,
      });

      editForm.reset();
      setEditDialogOpen(false);
      setSelectedCampus(null);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || "Không thể cập nhật campus lúc này.",
      });
    }
  };

  const handleOpenDeleteDialog = (campus: any) => {
    setSelectedCampus(campus);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCampus = async () => {
    if (!selectedCampus) return;

    try {
      await deleteCampus(selectedCampus.campusID).unwrap();

      toast({
        title: "Đã xóa campus",
        description: `Campus "${selectedCampus.campusName}" đã bị xóa khỏi hệ thống.`,
      });

      setDeleteDialogOpen(false);
      setSelectedCampus(null);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || "Không thể xóa campus lúc này.",
      });
    }
  };

  // Sort campuses
  console.log("Sort state:", { sortField, sortOrder });
  const sortedCampuses = [...campuses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.campusName.localeCompare(b.campusName);
        break;
      case 'id':
        comparison = a.campusID - b.campusID;
        break;
      case 'storage':
        comparison = a.storageLocation.localeCompare(b.storageLocation);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  console.log("Sorted campuses:", sortedCampuses.map(c => ({ id: c.campusID, name: c.campusName })));

  const toggleSort = (field: SortField) => {
    console.log("Toggle sort clicked:", field);
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Campus</h1>
          <p className="text-slate-500 mt-1">
            Thêm mới và quản lý các cơ sở trong hệ thống.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm Campus mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm Campus mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để thêm một cơ sở mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="campusName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên Campus <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="VD: HCM - NVH Sinh Viên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storageLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vị trí lưu trữ <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Phòng P.102" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      form.reset();
                    }}
                    disabled={isCreating}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tạo Campus
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sort Controls */}
      {campuses.length > 0 && (
        <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-lg border">
          <span className="text-sm font-medium text-slate-700">Sắp xếp theo:</span>
          <div className="flex gap-2">
            <Button
              variant={sortField === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSort('name')}
              className="gap-2"
            >
              Tên Campus
              <ArrowUpDown className="h-3 w-3" />
              {sortField === 'name' && (
                <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
            <Button
              variant={sortField === 'id' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSort('id')}
              className="gap-2"
            >
              ID
              <ArrowUpDown className="h-3 w-3" />
              {sortField === 'id' && (
                <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
            <Button
              variant={sortField === 'storage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSort('storage')}
              className="gap-2"
            >
              Vị trí lưu trữ
              <ArrowUpDown className="h-3 w-3" />
              {sortField === 'storage' && (
                <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
          </div>
          <Badge variant="outline" className="ml-auto">
            Tổng: {campuses.length} campus
          </Badge>
        </div>
      )}

      {/* Campuses List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : campuses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCampuses.map((campus) => (
            <Card key={campus.campusID} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{campus.campusName}</CardTitle>
                      <Badge variant="outline" className="mt-1">ID: {campus.campusID}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Địa chỉ:</p>
                    <p className="text-slate-600">{campus.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Vị trí lưu trữ:</p>
                    <p className="text-slate-600">{campus.storageLocation}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEditDialog(campus)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Sửa
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleOpenDeleteDialog(campus)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-medium text-slate-900">Chưa có Campus nào</h3>
          <p className="text-slate-500 mt-2 max-w-sm text-center">
            Bắt đầu bằng cách thêm Campus đầu tiên vào hệ thống.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Thêm Campus mới
          </Button>
        </div>
      )}

      {/* Edit Campus Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sửa thông tin Campus</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedCampus?.campusName}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="campusName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Campus <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: HCM - NVH Sinh Viên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nhập địa chỉ đầy đủ của campus" 
                        className="resize-none" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="storageLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vị trí lưu trữ đồ vật <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Phòng P.102, Tòa A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    editForm.reset();
                    setSelectedCampus(null);
                  }}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Campus Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Campus</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa campus <strong>{selectedCampus?.campusName}</strong>?
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampus}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
};

export default AdminCampusPage;

