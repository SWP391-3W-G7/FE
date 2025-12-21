import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, UserPlus, Shield, Users, MapPin, Loader2, Edit, Ban, UserX, Eye } from 'lucide-react';
import { useGetAdminUsersQuery, useGetCampusesQuery, useAssignUserMutation, useCreateUserMutation, useUpdateUserMutation, useBanUserMutation, useGetUserDetailQuery } from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";
import AdminNav from '@/components/AdminNav';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const assignUserSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn người dùng"),
  role: z.enum(['STAFF', 'SECURITY'], { required_error: "Vui lòng chọn vai trò" }),
  campusId: z.string().min(1, "Vui lòng chọn campus"),
});

const createUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  role: z.enum(['STAFF', 'SECURITY'], { required_error: "Vui lòng chọn vai trò" }),
  campusId: z.string().min(1, "Vui lòng chọn campus"),
});

const editUserSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phoneNumber: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  campusId: z.string().min(1, "Vui lòng chọn campus"),
  status: z.string().min(1, "Vui lòng chọn trạng thái"),
});

type AssignUserFormValues = z.infer<typeof assignUserSchema>;
type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<string | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [selectedUserForBan, setSelectedUserForBan] = useState<any>(null);
  const [selectedUserIdForDetail, setSelectedUserIdForDetail] = useState<number | null>(null);

  const { data: users = [], isLoading, refetch } = useGetAdminUsersQuery({
    role: selectedRole === "all" ? undefined : selectedRole,
  });

  const { data: campuses = [] } = useGetCampusesQuery();
  const [assignUser, { isLoading: isAssigning }] = useAssignUserMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  
  const { data: userDetail, isLoading: isLoadingDetail } = useGetUserDetailQuery(
    selectedUserIdForDetail!, 
    { skip: selectedUserIdForDetail === null }
  );

  const assignForm = useForm<AssignUserFormValues>({
    resolver: zodResolver(assignUserSchema),
    defaultValues: {
      userId: "",
      role: "STAFF",
      campusId: "",
    },
  });

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      password: "",
      role: "STAFF",
      campusId: "",
    },
  });

  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      campusId: "",
      status: "Active",
    },
  });

  // Filter users by keyword and campus - ensure array safety
  const usersArray = Array.isArray(users) ? users : [];
  let filteredUsers = usersArray;

  // Filter out pending users (users who haven't been approved yet)
  // Pending users are identified by having isActive = false AND role = USER/STUDENT
  // (meaning they registered but haven't been assigned a role like STAFF/SECURITY)
  filteredUsers = filteredUsers.filter(user => {
    // If status field exists and is "Pending", filter out
    if (user.status === "Pending" || user.status === "Chờ duyệt") {
      return false;
    }
    // Also filter out inactive regular users (they should be in pending page)
    if (!user.isActive && (user.role === 'USER' || user.role === 'STUDENT')) {
      return false;
    }
    return true;
  });

  // Filter by keyword
  if (keyword.trim()) {
    filteredUsers = filteredUsers.filter(user =>
      (user.fullName || '').toLowerCase().includes(keyword.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Filter by campus
  if (selectedCampus !== "all") {
    filteredUsers = filteredUsers.filter(user => 
      user.campusName && campuses.find(c => c.campusId.toString() === selectedCampus)?.campusName === user.campusName
    );
  }

  // Filter by role
  if (selectedRole !== "all") {
    filteredUsers = filteredUsers.filter(user => user.role === selectedRole);
  }

  // Sort users by roleId: USER(1) > STAFF(2) > SECURITY(3), then by name
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // First sort by roleId
    const roleOrder: Record<string, number> = { USER: 1, STUDENT: 1, STAFF: 2, SECURITY: 3 };
    const roleA = roleOrder[a.role] ?? 999;
    const roleB = roleOrder[b.role] ?? 999;
    
    if (roleA !== roleB) {
      return roleA - roleB;
    }
    
    // Then sort by name alphabetically
    return a.fullName.localeCompare(b.fullName);
  });
  
  console.log("Sorted users:", sortedUsers.map(u => ({ name: u.fullName, role: u.role })));

  // Sort campuses alphabetically
  console.log("Campuses from API:", campuses);
  const sortedCampuses = [...campuses].filter(c => c?.campusName).sort((a, b) => 
    a.campusName.localeCompare(b.campusName)
  );

  const handleOpenAssignDialog = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserForAssign(userId);
      assignForm.reset({
        userId: userId,
        role: user.role === 'STAFF' || user.role === 'SECURITY' ? user.role : 'STAFF',
        campusId: user.campusId || "",
      });
      setAssignDialogOpen(true);
    }
  };

  const onAssignSubmit = async (data: AssignUserFormValues) => {
    try {
      console.log("=== ASSIGN USER DEBUG ===");
      console.log("1. Form data:", JSON.stringify(data, null, 2));
      
      // Transform to API format
      const payload = {
        userId: parseInt(data.userId),
        campusId: parseInt(data.campusId),
        roleId: data.role === 'STAFF' ? 2 : 3, // STAFF=2, SECURITY=3
      };
      
      console.log("2. Final payload:", JSON.stringify(payload, null, 2));
      const response = await assignUser(payload as any).unwrap();
      console.log("3. API response:", response);

      toast({
        title: "Phân công thành công!",
        description: `Người dùng đã được phân công vai trò ${data.role === 'STAFF' ? 'Staff' : 'Security'} tại campus đã chọn.`,
      });

      assignForm.reset();
      setAssignDialogOpen(false);
      setSelectedUserForAssign(null);
      refetch();
    } catch (error: any) {
      console.error("=== ASSIGN ERROR ===", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || "Không thể phân công người dùng lúc này.",
      });
    }
  };

  const onCreateSubmit = async (data: CreateUserFormValues) => {
    try {
      console.log("Creating user with data:", data);
      
      // API expects: username, email, password, fullName, roleId, campusId, phoneNumber
      const payload = {
        username: data.email.split('@')[0], // username from email
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phone,
        roleId: data.role === 'STAFF' ? 2 : 3, // STAFF=2, SECURITY=3 (adjust based on API)
        campusId: parseInt(data.campusId),
      };
      
      console.log("Sending payload:", payload);
      await createUser(payload as any).unwrap();

      toast({
        title: "Tạo tài khoản thành công!",
        description: `Tài khoản ${data.role === 'STAFF' ? 'Staff' : 'Security Officer'} đã được tạo.`,
      });

      createForm.reset();
      setCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error creating user:", error);
      console.log("Error response data:", error?.data);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || JSON.stringify(error?.data) || "Không thể tạo tài khoản lúc này.",
      });
    }
  };

  const handleOpenEditDialog = (user: any) => {
    setSelectedUserForEdit(user);
    editForm.reset({
      fullName: user.fullName,
      phoneNumber: user.phone || "",
      campusId: user.campusId?.toString() || "",
      status: user.isActive ? "Active" : "Inactive",
    });
    setEditDialogOpen(true);
  };

  const onEditSubmit = async (data: EditUserFormValues) => {
    if (!selectedUserForEdit) return;

    try {
      console.log("=== UPDATE USER DEBUG ===");
      console.log("1. Form data:", JSON.stringify(data, null, 2));
      console.log("2. Selected user:", JSON.stringify(selectedUserForEdit, null, 2));
      
      // Map role to roleId: STUDENT=1, STAFF=2, SECURITY=3
      const roleId = selectedUserForEdit.role === 'STAFF' ? 2 : selectedUserForEdit.role === 'SECURITY' ? 3 : 1;
      
      const payload = {
        id: parseInt(selectedUserForEdit.id),
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        roleId: roleId,
        campusId: parseInt(data.campusId),
        isActive: data.status === 'Active',
      };

      console.log("3. Final payload (với isActive):", JSON.stringify(payload, null, 2));
      const response = await updateUser(payload).unwrap();
      console.log("4. API response:", response);

      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin người dùng đã được cập nhật.",
      });

      editForm.reset();
      setEditDialogOpen(false);
      setSelectedUserForEdit(null);
      refetch();
    } catch (error: any) {
      console.error("Update user error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || "Không thể cập nhật người dùng lúc này.",
      });
    }
  };

  const handleOpenBanDialog = (user: any) => {
    setSelectedUserForBan(user);
    setBanDialogOpen(true);
  };

  const handleOpenDetailDialog = (userId: number) => {
    setSelectedUserIdForDetail(userId);
    setDetailDialogOpen(true);
  };

  const handleBanUser = async () => {
    if (!selectedUserForBan) return;

    try {
      const isBan = selectedUserForBan.isActive; // If active, ban them. If inactive, unban them.

      await banUser({
        id: parseInt(selectedUserForBan.id),
        isBan: isBan,
      }).unwrap();

      toast({
        title: isBan ? "Đã khóa người dùng" : "Đã mở khóa người dùng",
        description: isBan 
          ? "Người dùng đã bị khóa và không thể truy cập hệ thống."
          : "Người dùng đã được mở khóa và có thể truy cập hệ thống.",
      });

      setBanDialogOpen(false);
      setSelectedUserForBan(null);
      refetch();
    } catch (error: any) {
      console.error("Ban user error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.data?.message || "Không thể thực hiện thao tác lúc này.",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'STAFF':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Staff</Badge>;
      case 'SECURITY':
        return <Badge className="bg-green-500 hover:bg-green-600">Security</Badge>;
      case 'ADMIN':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
      case 'USER':
      case 'STUDENT':
        return <Badge className="bg-gray-500 hover:bg-gray-600">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-1">
            Phân công vai trò Staff và Security Officers cho các campus.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" /> Tạo tài khoản mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản Staff/Security mới</DialogTitle>
              <DialogDescription>
                Tạo tài khoản cho nhân viên Staff hoặc Security Officer.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="staff@fpt.edu.vn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="0987654321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mật khẩu" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STAFF">Staff</SelectItem>
                          <SelectItem value="SECURITY">Security Officer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="campusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campus <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn campus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sortedCampuses.filter(campus => campus?.campusId).map((campus) => (
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

                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tạo tài khoản
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên, email..."
              className="pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="SECURITY">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <SelectValue placeholder="Campus" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Campus</SelectItem>
                {sortedCampuses.filter(campus => campus?.campusId).map((campus) => (
                  <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                    {campus.campusName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1">
            <Button
              variant="ghost"
              className="w-full text-xs text-slate-500"
              onClick={() => {
                setKeyword("");
                setSelectedRole("all");
                setSelectedCampus("all");
              }}
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả ({sortedUsers.length})</TabsTrigger>
          <TabsTrigger value="USER">User ({sortedUsers.filter(u => u.role === 'USER' || u.role === 'STUDENT').length})</TabsTrigger>
          <TabsTrigger value="STAFF">Staff ({sortedUsers.filter(u => u.role === 'STAFF').length})</TabsTrigger>
          <TabsTrigger value="SECURITY">Security ({sortedUsers.filter(u => u.role === 'SECURITY').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderUsersList(sortedUsers, isLoading, handleOpenAssignDialog, handleOpenEditDialog, handleOpenBanDialog, handleOpenDetailDialog, getRoleBadge)}
        </TabsContent>

        <TabsContent value="SECURITY">
          {renderUsersList(
            sortedUsers.filter(u => u.role === 'SECURITY'),
            isLoading,
            handleOpenAssignDialog,
            handleOpenEditDialog,
            handleOpenBanDialog,
            handleOpenDetailDialog,
            getRoleBadge
          )}
        </TabsContent>

        <TabsContent value="STAFF">
          {renderUsersList(
            sortedUsers.filter(u => u.role === 'STAFF'),
            isLoading,
            handleOpenAssignDialog,
            handleOpenEditDialog,
            handleOpenBanDialog,
            handleOpenDetailDialog,
            getRoleBadge
          )}
        </TabsContent>

        <TabsContent value="USER">
          {renderUsersList(
            sortedUsers.filter(u => u.role === 'USER' || u.role === 'STUDENT'),
            isLoading,
            handleOpenAssignDialog,
            handleOpenEditDialog,
            handleOpenBanDialog,
            handleOpenDetailDialog,
            getRoleBadge
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Phân công người dùng</DialogTitle>
            <DialogDescription>
              Chọn vai trò và campus để phân công cho người dùng.
            </DialogDescription>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} className="space-y-4">
              <FormField
                control={assignForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STAFF">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Staff
                          </div>
                        </SelectItem>
                        <SelectItem value="SECURITY">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignForm.control}
                name="campusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campus <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn campus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sortedCampuses.filter(campus => campus?.campusId).map((campus) => (
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAssignDialogOpen(false);
                    assignForm.reset();
                  }}
                  disabled={isAssigning}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isAssigning} className="bg-blue-600 hover:bg-blue-700">
                  {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Phân công
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedUserForEdit?.fullName}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="0912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="campusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campus <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn campus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sortedCampuses.filter(campus => campus?.campusId).map((campus) => (
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
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Hoạt động</SelectItem>
                        <SelectItem value="Inactive">Không hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
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
                    setSelectedUserForEdit(null);
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

      {/* Ban/Unban User Alert Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUserForBan?.isActive ? 'Khóa người dùng' : 'Mở khóa người dùng'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUserForBan?.isActive ? (
                <>
                  Bạn có chắc chắn muốn khóa <strong>{selectedUserForBan?.fullName}</strong>?
                  Người dùng sẽ không thể truy cập hệ thống sau khi bị khóa.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn mở khóa <strong>{selectedUserForBan?.fullName}</strong>?
                  Người dùng sẽ có thể truy cập hệ thống trở lại.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBanning}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              disabled={isBanning}
              className={selectedUserForBan?.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isBanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedUserForBan?.isActive ? 'Khóa' : 'Mở khóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Xem đầy đủ thông tin của người dùng trong hệ thống
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetail ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : userDetail ? (
            <div className="space-y-4">
              {userDetail.studentIdCardUrl && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Hình thẻ sinh viên
                  </label>
                  <img
                    src={userDetail.studentIdCardUrl}
                    alt="Student ID Card"
                    className="w-full max-h-96 object-contain rounded-lg border"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">ID</label>
                  <p className="text-slate-900 mt-1">{userDetail.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Username</label>
                  <p className="text-slate-900 mt-1">{userDetail.username || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                  <p className="text-slate-900 mt-1">{userDetail.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900 mt-1">{userDetail.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                  <p className="text-slate-900 mt-1">{userDetail.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Vai trò</label>
                  <div className="mt-1">{userDetail.roleName}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Campus</label>
                  <p className="text-slate-900 mt-1">{userDetail.campusName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Trạng thái</label>
                  <div className="mt-1">
                    {userDetail.status === 'Active' ? (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Hoạt động
                      </Badge>
                    ) : userDetail.status === 'Pending' ? (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        Chờ duyệt
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600">
                        Không hoạt động
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Không thể tải thông tin người dùng</p>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

// Helper function to render users list
const renderUsersList = (
  users: any[],
  isLoading: boolean,
  onAssign: (userId: string) => void,
  onEdit: (user: any) => void,
  onBan: (user: any) => void,
  onDetail: (userId: number) => void,
  getRoleBadge: (role: string) => JSX.Element
) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-slate-300" />
          </div>
        <h3 className="text-xl font-medium text-slate-900">Không có người dùng nào</h3>
        <p className="text-slate-500 mt-2 max-w-sm text-center">
          Không tìm thấy người dùng phù hợp với bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{user.fullName}</h3>
                    {getRoleBadge(user.role)}
                    {user.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600">
                        Không hoạt động
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                  {user.campusName && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span>{user.campusName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDetail(parseInt(user.id))}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Chi tiết
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssign(user.id)}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Phân công
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Sửa
                </Button>
                <Button
                  variant={user.isActive ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onBan(user)}
                >
                  {user.isActive ? (
                    <>
                      <Ban className="h-3 w-3 mr-1" />
                      Khóa
                    </>
                  ) : (
                    <>
                      <UserX className="h-3 w-3 mr-1" />
                      Mở khóa
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminUsersPage;

