import { useState } from 'react';
import { Plus, ArrowUpDown } from 'lucide-react';
import {
  useGetCampusesQuery,
  useCreateCampusMutation,
  useUpdateCampusMutation,
  useDeleteCampusMutation
} from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Modular Components
import { CampusList } from '@/features/admin/campus/components/CampusList';
import { CampusFormModal } from '@/features/admin/campus/components/CampusFormModal';
import type { CampusFormValues } from '@/features/admin/campus/components/CampusFormModal';
import { CampusDeleteModal } from '@/features/admin/campus/components/CampusDeleteModal';
import type { SortField, SortOrder } from '@/features/admin/campus/types/campus';
import type { Campus } from '@/types';

const AdminCampusPage = () => {
  const { toast } = useToast();

  // Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  // Sort States
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // API Queries & Mutations
  const { data: campuses = [], isLoading, refetch } = useGetCampusesQuery();
  const [createCampus, { isLoading: isCreating }] = useCreateCampusMutation();
  const [updateCampus, { isLoading: isUpdating }] = useUpdateCampusMutation();
  const [deleteCampus, { isLoading: isDeleting }] = useDeleteCampusMutation();

  // Handlers
  const handleOpenCreate = () => {
    setSelectedCampus(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (campus: Campus) => {
    setSelectedCampus(campus);
    setFormOpen(true);
  };

  const handleOpenDelete = (campus: Campus) => {
    setSelectedCampus(campus);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (values: CampusFormValues) => {
    try {
      if (selectedCampus) {
        await updateCampus({
          id: selectedCampus.campusId,
          ...values,
        }).unwrap();
        toast({ title: "Cập nhật thành công!", description: `Cơ sở "${values.campusName}" đã được cập nhật.` });
      } else {
        await createCampus(values).unwrap();
        toast({ title: "Tạo thành công!", description: `Cơ sở "${values.campusName}" đã được thêm.` });
      }
      setFormOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || "Không thể thực hiện tác vụ lúc này."
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCampus) return;
    try {
      await deleteCampus(selectedCampus.campusId).unwrap();
      toast({ title: "Đã xóa", description: `Cơ sở "${selectedCampus.campusName}" đã bị loại bỏ.` });
      setDeleteOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || "Không thể xóa cơ sở này."
      });
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Logic Sắp xếp
  const sortedCampuses = [...campuses]
    .filter(Boolean)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.campusName || '').localeCompare(b.campusName || '');
          break;
        case 'id':
          comparison = Number(a.campusId) - Number(b.campusId);
          break;
        case 'storage':
          comparison = (a.storageLocation || '').localeCompare(b.storageLocation || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Quản lý Campus</h1>
          <p className="text-slate-500 font-medium">
            Quản lý và điều phối các cơ sở lưu trữ vật phẩm trong hệ thống.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-lg shadow-indigo-900/10 transition-all hover:-translate-y-0.5">
          <Plus className="mr-2 h-5 w-5" /> Thêm Campus mới
        </Button>
      </div>

      {/* Toolbar Section */}
      {!isLoading && campuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase ml-2">Sắp xếp:</span>
          <div className="flex gap-2">
            {[
              { id: 'name', label: 'Tên cơ sở' },
              { id: 'id', label: 'Mã số ID' },
              { id: 'storage', label: 'Vị trí kho' }
            ].map((f) => (
              <Button
                key={f.id}
                variant={sortField === f.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => toggleSort(f.id as SortField)}
                className={`h-8 text-xs gap-2 ${sortField === f.id ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'text-slate-600'}`}
              >
                {f.label}
                <ArrowUpDown className={`h-3 w-3 ${sortField === f.id ? 'opacity-100' : 'opacity-30'}`} />
                {sortField === f.id && (
                  <span className="font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
            ))}
          </div>
          <div className="ml-auto pr-2">
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">
              Tổng số: {campuses.length}
            </Badge>
          </div>
        </div>
      )}

      {/* Main List Section */}
      <CampusList
        campuses={sortedCampuses}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Modals */}
      <CampusFormModal
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedCampus}
        isLoading={isCreating || isUpdating}
      />

      <CampusDeleteModal
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        campus={selectedCampus}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCampusPage;

