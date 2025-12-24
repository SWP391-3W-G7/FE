import { Package, CheckCheck, FileText, Clock, AlertTriangle, XCircle, Inbox } from 'lucide-react';
import { useGetStaffStatsQuery } from '@/features/items/itemApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Badge } from "@/components/ui/badge";

// Helper function to get count from stats array
const getStatCount = (stats: { statusName: string; count: number }[] | undefined, statusName: string) => {
  return stats?.find(s => s.statusName === statusName)?.count || 0;
};

export const StaffStats = () => {
  const user = useAppSelector(selectCurrentUser);
  const { data: stats, isLoading } = useGetStaffStatsQuery({ campusId: user?.campusId });

  if (isLoading) return <div className="p-4 text-center text-slate-500">Đang tính toán số liệu...</div>;

  // Extract stats
  const storedCount = getStatCount(stats?.foundItemStats, 'Stored');
  const returnedCount = getStatCount(stats?.foundItemStats, 'Returned');
  const openCount = getStatCount(stats?.foundItemStats, 'Open');
  const closedCount = getStatCount(stats?.foundItemStats, 'Closed');

  const pendingClaims = getStatCount(stats?.claimStats, 'Pending');
  const approvedClaims = getStatCount(stats?.claimStats, 'Approved');
  const conflictedClaims = getStatCount(stats?.claimStats, 'Conflicted');
  const rejectedClaims = getStatCount(stats?.claimStats, 'Rejected');

  return (
    <div className="space-y-6">
      {/* ROW 1: TỔNG QUAN */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đồ nhặt được</CardTitle>
            <Package className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFound || 0}</div>
            <p className="text-xs text-muted-foreground">Tất cả đồ đã ghi nhận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang lưu kho</CardTitle>
            <Inbox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{storedCount}</div>
            <p className="text-xs text-muted-foreground">Chờ người nhận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã trả thành công</CardTitle>
            <CheckCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{returnedCount}</div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ: {stats?.totalFound ? Math.round((returnedCount / stats.totalFound) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ nhập kho</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{openCount}</div>
            <p className="text-xs text-muted-foreground">Từ Security</p>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: CLAIMS STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims chờ duyệt</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingClaims}</div>
            {pendingClaims > 0 && (
              <Badge variant="outline" className="mt-1 text-xs border-yellow-300 text-yellow-700 bg-yellow-50">
                Cần xử lý
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tranh chấp</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflictedClaims}</div>
            {conflictedClaims > 0 && (
              <Badge variant="destructive" className="mt-1 text-xs">
                Ưu tiên cao
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims đã duyệt</CardTitle>
            <CheckCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedClaims}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-500">{rejectedClaims}</div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: CATEGORY STATS & NOTES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Phân loại đồ thất lạc</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {(() => {
                // Filter out categories with no name or count = 0
                const validCategories = stats?.categoryStats?.filter(
                  (cat) => cat.categoryName && cat.count > 0
                ) || [];
                
                if (validCategories.length === 0) {
                  return <p className="text-sm text-slate-400 italic">Chưa có dữ liệu phân loại</p>;
                }
                
                const maxCount = Math.max(...validCategories.map(c => c.count), 1);
                
                return validCategories.map((cat) => (
                  <div key={cat.categoryName} className="flex items-center">
                    <div className="w-[120px] text-sm font-medium text-slate-600 truncate">
                      {cat.categoryName}
                    </div>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden mx-2">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all" 
                        style={{ width: `${(cat.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <div className="w-[40px] text-right text-sm font-semibold text-slate-700">
                      {cat.count}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tổng quan nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">Tổng Claims</span>
                <span className="font-bold">{stats?.totalClaims || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">Đồ đã đóng</span>
                <span className="font-bold">{closedCount}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm text-green-700">Tỷ lệ trả đồ</span>
                <span className="font-bold text-green-700">
                  {stats?.totalFound ? Math.round((returnedCount / stats.totalFound) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};