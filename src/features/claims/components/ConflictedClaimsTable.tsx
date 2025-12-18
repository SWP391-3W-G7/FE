import { format } from 'date-fns';
import { Eye, AlertTriangle, User, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// API
import { useGetConflictedClaimsQuery } from '@/features/claims/claimApi';

// UI
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ConflictedClaimsTable = () => {
    const { data: claims, isLoading, error } = useGetConflictedClaimsQuery();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
                Có lỗi xảy ra khi tải danh sách tranh chấp.
            </div>
        );
    }

    if (!claims || claims.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                Hiện không có tranh chấp nào cần xử lý.
            </div>
        );
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'High':
                return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
            case 'Medium':
                return <Badge className="bg-orange-500 hover:bg-orange-600">Medium</Badge>;
            case 'Low':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    return (
        <Card className="border-red-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-red-50/50">
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Vật phẩm</TableHead>
                            <TableHead>Sinh viên</TableHead>
                            <TableHead>Ngày gửi</TableHead>
                            <TableHead>Mức độ</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {claims.map((claim) => (
                            <TableRow key={claim.claimId} className="hover:bg-slate-50/50 border-red-50">
                                <TableCell className="font-mono text-xs font-bold">
                                    #{claim.claimId}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{claim.foundItemTitle}</span>
                                        <span className="text-[10px] text-slate-400">ID: {claim.foundItemId}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{claim.studentName}</span>
                                            <span className="text-xs text-slate-500">MSSV: {claim.studentId}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        {format(new Date(claim.claimDate), "dd/MM/yyyy")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getPriorityBadge(claim.priority as string)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                        onClick={() => {
                                            // TODO: Chuyển đến trang chi tiết hoặc xử lý tranh chấp
                                            // Hiện tại có thể chuyển tới Tab Xử lý & Duyệt và chọn claim này
                                            // Hoặc mở 1 modal chi tiết.
                                            // Vì đây là table trong Dashboard, ta có thể emit 1 event hoặc navigate.
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
