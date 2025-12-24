import { useState } from 'react';
import { UserCheck, UserX, Loader2, Eye, Users } from 'lucide-react';
import { useGetPendingUsersQuery, useApproveUserMutation, useRejectUserMutation } from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PendingUser {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  status: string;
  campusId: number;
  phoneNumber: string;
  roleName: string;
  campusName: string;
  studentIdCardUrl: string;
}

const PendingUsersPage = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [userToAction, setUserToAction] = useState<PendingUser | null>(null);

  const { data: pendingUsers = [], isLoading, refetch } = useGetPendingUsersQuery();
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();

  const handleApproveClick = (user: PendingUser) => {
    setUserToAction(user);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (user: PendingUser) => {
    setUserToAction(user);
    setRejectDialogOpen(true);
  };

  const handleViewClick = (user: PendingUser) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!userToAction) return;

    try {
      await approveUser(userToAction.userId).unwrap();
      toast({
        title: "Thành công",
        description: `Đã duyệt user ${userToAction.fullName}`,
      });
      setApproveDialogOpen(false);
      setUserToAction(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.data?.message || "Không thể duyệt user",
        variant: "destructive",
      });
    }
  };

  const confirmReject = async () => {
    if (!userToAction) return;

    try {
      await rejectUser(userToAction.userId).unwrap();
      toast({
        title: "Thành công",
        description: `Đã từ chối user ${userToAction.fullName}`,
      });
      setRejectDialogOpen(false);
      setUserToAction(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.data?.message || "Không thể từ chối user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">


      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Quản lý Users Đang Chờ Duyệt
          </h1>
          <p className="text-slate-600 mt-2">
            Duyệt hoặc từ chối các tài khoản đăng ký mới
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                Không có user nào đang chờ duyệt
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <Card key={user.userId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {user.studentIdCardUrl && (
                        <img
                          src={user.studentIdCardUrl}
                          alt={user.fullName}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-slate-800">
                            {user.fullName}
                          </h3>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {user.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">Email:</span>{' '}
                            <span className="text-slate-700 font-medium">{user.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Username:</span>{' '}
                            <span className="text-slate-700 font-medium">{user.username}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Số điện thoại:</span>{' '}
                            <span className="text-slate-700 font-medium">{user.phoneNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Campus:</span>{' '}
                            <span className="text-slate-700 font-medium">{user.campusName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Vai trò:</span>{' '}
                            <Badge variant="outline">{user.roleName}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveClick(user)}
                        disabled={isApproving || isRejecting}
                      >
                        {isApproving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4 mr-1" />
                        )}
                        Duyệt
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectClick(user)}
                        disabled={isApproving || isRejecting}
                      >
                        {isRejecting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4 mr-1" />
                        )}
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận duyệt user</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn duyệt user <strong>{userToAction?.fullName}</strong>?
              Sau khi duyệt, user sẽ có thể đăng nhập vào hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận duyệt'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận từ chối user</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn từ chối user <strong>{userToAction?.fullName}</strong>?
              User sẽ không thể đăng nhập vào hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận từ chối'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết User</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về user đang chờ duyệt
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {selectedUser.studentIdCardUrl && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Hình thẻ sinh viên
                  </label>
                  <img
                    src={selectedUser.studentIdCardUrl}
                    alt="Student ID Card"
                    className="w-full max-h-96 object-contain rounded-lg border"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                  <p className="text-slate-900 mt-1">{selectedUser.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Username</label>
                  <p className="text-slate-900 mt-1">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900 mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                  <p className="text-slate-900 mt-1">{selectedUser.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Campus</label>
                  <p className="text-slate-900 mt-1">{selectedUser.campusName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Vai trò</label>
                  <p className="text-slate-900 mt-1">{selectedUser.roleName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Trạng thái</label>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleApproveClick(selectedUser);
                  }}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Duyệt
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleRejectClick(selectedUser);
                  }}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingUsersPage;
