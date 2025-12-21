import { useState } from 'react';
import { 
  useGetUnreturnedItemsCountQuery,
  useGetFoundItemsMonthlyQuery,
  useGetTopContributorQuery,
  useGetCampusMostLostItemsQuery,
  useGetUserMostLostItemsQuery,
  useGetLostItemsStatusStatsQuery,
  useGetFoundItemsStatusStatsQuery,
  useGetClaimStatusStatsQuery,
  useGetUserDetailQuery
} from '@/features/items/itemApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, FileQuestion, CheckCircle2, MapPin, Users, TrendingUp, Trophy, AlertCircle, Eye } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import AdminNav from '@/components/AdminNav';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminDashboard = () => {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUserIdForDetail, setSelectedUserIdForDetail] = useState<number | null>(null);
  
  const { data: unreturnedCount, isLoading: loadingUnreturned } = useGetUnreturnedItemsCountQuery();
  const { data: monthlyData, isLoading: loadingMonthly } = useGetFoundItemsMonthlyQuery();
  const { data: topContributors, isLoading: loadingContributors } = useGetTopContributorQuery();
  const { data: campusLostItems, isLoading: loadingCampusLost } = useGetCampusMostLostItemsQuery();
  const { data: userLostItems, isLoading: loadingUserLost } = useGetUserMostLostItemsQuery();
  const { data: lostItemsStats, isLoading: loadingLostStats } = useGetLostItemsStatusStatsQuery();
  const { data: foundItemsStats, isLoading: loadingFoundStats } = useGetFoundItemsStatusStatsQuery();
  const { data: claimStats, isLoading: loadingClaimStats } = useGetClaimStatusStatsQuery();
  
  const { data: userDetail, isLoading: isLoadingDetail } = useGetUserDetailQuery(
    selectedUserIdForDetail!, 
    { skip: selectedUserIdForDetail === null }
  );

  const handleOpenDetailDialog = (userId: number) => {
    setSelectedUserIdForDetail(userId);
    setDetailDialogOpen(true);
  };

  const isLoading = loadingUnreturned || loadingMonthly || loadingContributors || 
                   loadingCampusLost || loadingUserLost || loadingLostStats || 
                   loadingFoundStats || loadingClaimStats;

  if (isLoading) {
    return (
      <>
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Tổng quan về tình trạng đồ vật thất lạc và nhặt được trong hệ thống
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đồ chưa trả</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreturnedCount || 0}</div>
              <p className="text-xs text-muted-foreground">Đồ nhặt được chưa trả</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đồ thất lạc</CardTitle>
              <FileQuestion className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Array.isArray(lostItemsStats) ? lostItemsStats.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Tổng báo cáo thất lạc</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đồ nhặt được</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(foundItemsStats) ? foundItemsStats.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Tổng đồ nhặt được</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yêu cầu nhận đồ</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(claimStats) ? claimStats.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Tổng yêu cầu claim</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Lost Items Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trạng thái đồ thất lạc</CardTitle>
              <CardDescription>Phân bổ theo trạng thái</CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(lostItemsStats) && lostItemsStats.length > 0 ? (
                <div className="space-y-4">
                  {lostItemsStats.map((stat: any) => {
                    const statusValue = stat.status || stat.statusName || stat.scope;
                    const countValue = typeof stat.count === 'object' ? stat.count?.count || 0 : stat.count || 0;
                    const maxCount = 50;
                    const widthPercent = Math.min((countValue / maxCount) * 100, 100);
                    
                    const getColor = (status: string) => {
                      if (status?.toLowerCase().includes('open') || status?.toLowerCase().includes('lost')) return 'bg-orange-500';
                      if (status?.toLowerCase().includes('closed')) return 'bg-gray-400';
                      if (status?.toLowerCase().includes('found') || status?.toLowerCase().includes('match')) return 'bg-green-500';
                      return 'bg-blue-500';
                    };
                    
                    return (
                      <div key={statusValue} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{statusValue}</span>
                          <span className="font-semibold text-slate-900">{countValue}</span>
                        </div>
                        <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getColor(statusValue)} transition-all duration-500`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center">Không có dữ liệu</p>
              )}
            </CardContent>
          </Card>

          {/* Found Items Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trạng thái đồ nhặt được</CardTitle>
              <CardDescription>Phân bổ theo trạng thái</CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(foundItemsStats) && foundItemsStats.length > 0 ? (
                <div className="space-y-4">
                  {foundItemsStats.map((stat: any) => {
                    const statusValue = stat.status || stat.statusName || stat.scope;
                    const countValue = typeof stat.count === 'object' ? stat.count?.count || 0 : stat.count || 0;
                    const maxCount = 50;
                    const widthPercent = Math.min((countValue / maxCount) * 100, 100);
                    
                    const getColor = (status: string) => {
                      if (status?.toLowerCase().includes('open')) return 'bg-orange-500';
                      if (status?.toLowerCase().includes('stored')) return 'bg-blue-500';
                      if (status?.toLowerCase().includes('returned')) return 'bg-green-500';
                      if (status?.toLowerCase().includes('claimed')) return 'bg-yellow-500';
                      return 'bg-gray-400';
                    };
                    
                    return (
                      <div key={statusValue} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{statusValue}</span>
                          <span className="font-semibold text-slate-900">{countValue}</span>
                        </div>
                        <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getColor(statusValue)} transition-all duration-500`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center">Không có dữ liệu</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Claim Status - Pie Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Trạng thái yêu cầu nhận</CardTitle>
            <CardDescription>Phân bổ theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(claimStats) && claimStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Pie Chart */}
                <div className="flex justify-center">
                  <svg viewBox="0 0 200 200" className="w-64 h-64">
                    {(() => {
                      const total = claimStats.reduce((sum: number, stat: any) => {
                        const countValue = typeof stat.count === 'object' ? stat.count?.count || 0 : stat.count || 0;
                        return sum + countValue;
                      }, 0);
                      
                      if (total === 0) return null;
                      
                      let currentAngle = 0;
                      
                      return claimStats.map((stat: any, _index: number) => {
                        const statusValue = stat.status || stat.statusName || stat.scope;
                        const countValue = typeof stat.count === 'object' ? stat.count?.count || 0 : stat.count || 0;
                        const angle = (countValue / total) * 360;
                        
                        const getColor = (status: string) => {
                          if (status?.toLowerCase().includes('pending')) return '#f97316';
                          if (status?.toLowerCase().includes('approved')) return '#22c55e';
                          if (status?.toLowerCase().includes('rejected')) return '#ef4444';
                          if (status?.toLowerCase().includes('returned')) return '#3b82f6';
                          if (status?.toLowerCase().includes('conflicted')) return '#a855f7';
                          return '#9ca3af';
                        };
                        
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        currentAngle = endAngle;
                        
                        // Calculate path for pie slice
                        const startRad = (startAngle - 90) * (Math.PI / 180);
                        const endRad = (endAngle - 90) * (Math.PI / 180);
                        const x1 = 100 + 80 * Math.cos(startRad);
                        const y1 = 100 + 80 * Math.sin(startRad);
                        const x2 = 100 + 80 * Math.cos(endRad);
                        const y2 = 100 + 80 * Math.sin(endRad);
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        
                        return (
                          <g key={statusValue}>
                            <path
                              d={path}
                              fill={getColor(statusValue)}
                              stroke="white"
                              strokeWidth="2"
                              className="transition-opacity hover:opacity-80"
                            />
                          </g>
                        );
                      });
                    })()}
                  </svg>
                </div>
                
                {/* Legend */}
                <div className="space-y-3">
                  {claimStats.map((stat: any) => {
                    const statusValue = stat.status || stat.statusName || stat.scope;
                    const countValue = typeof stat.count === 'object' ? stat.count?.count || 0 : stat.count || 0;
                    const total = claimStats.reduce((sum: number, s: any) => {
                      const c = typeof s.count === 'object' ? s.count?.count || 0 : s.count || 0;
                      return sum + c;
                    }, 0);
                    const percentage = total > 0 ? ((countValue / total) * 100).toFixed(1) : 0;
                    
                    const getColor = (status: string) => {
                      if (status?.toLowerCase().includes('pending')) return 'bg-orange-500';
                      if (status?.toLowerCase().includes('approved')) return 'bg-green-500';
                      if (status?.toLowerCase().includes('rejected')) return 'bg-red-500';
                      if (status?.toLowerCase().includes('returned')) return 'bg-blue-500';
                      if (status?.toLowerCase().includes('conflicted')) return 'bg-purple-500';
                      return 'bg-gray-400';
                    };
                    
                    return (
                      <div key={statusValue} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${getColor(statusValue)}`}></div>
                          <span className="text-sm font-medium">{statusValue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">{percentage}%</span>
                          <Badge variant="outline">{countValue}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center">Không có dữ liệu</p>
            )}
          </CardContent>
        </Card>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Found Items Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Đồ nhặt được theo tháng
              </CardTitle>
              <CardDescription>Xu hướng 12 tháng gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(monthlyData) && monthlyData.length > 0 ? (
                <div className="space-y-4">
                  {/* Line Chart */}
                  <svg viewBox="0 0 600 250" className="w-full h-64">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <g key={i}>
                        <line
                          x1="60"
                          y1={40 + i * 35}
                          x2="580"
                          y2={40 + i * 35}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                        <text
                          x="45"
                          y={45 + i * 35}
                          fontSize="12"
                          fill="#64748b"
                          textAnchor="end"
                        >
                          {Math.round((5 - i) * 10)}
                        </text>
                      </g>
                    ))}
                    
                    {/* Line and area */}
                    {(() => {
                      const maxValue = Math.max(...monthlyData.map((item: any) => {
                        const c = typeof item.count === 'object' ? item.count?.count || 0 : item.count || 0;
                        return c;
                      }), 1);
                      const chartHeight = 175;
                      const chartWidth = 520;
                      const xStep = chartWidth / (monthlyData.length - 1 || 1);
                      
                      const points = monthlyData.map((item: any, index: number) => {
                        const countValue = typeof item.count === 'object' ? item.count?.count || 0 : item.count || 0;
                        const x = 60 + index * xStep;
                        const y = 215 - (countValue / maxValue) * chartHeight;
                        return { x, y, count: countValue };
                      });
                      
                      const linePathD = points.map((p, i) => 
                        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                      ).join(' ');
                      
                      const areaPathD = `M 60 215 ${linePathD} L ${points[points.length - 1].x} 215 Z`;
                      
                      return (
                        <>
                          {/* Area fill */}
                          <path
                            d={areaPathD}
                            fill="url(#gradient)"
                            opacity="0.3"
                          />
                          
                          {/* Line */}
                          <path
                            d={linePathD}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Points */}
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#3b82f6"
                                stroke="white"
                                strokeWidth="2"
                                className="cursor-pointer hover:r-6 transition-all"
                              />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                    
                    {/* X-axis labels */}
                    {monthlyData.map((item: any, index: number) => {
                      const xStep = 520 / (monthlyData.length - 1 || 1);
                      return (
                        <text
                          key={index}
                          x={60 + index * xStep}
                          y="235"
                          fontSize="11"
                          fill="#64748b"
                          textAnchor="middle"
                        >
                          {item.month || item.name}
                        </text>
                      );
                    })}
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Legend */}
                  <div className="flex justify-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Số lượng đồ nhặt được</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center">Không có dữ liệu</p>
              )}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top người đóng góp
              </CardTitle>
              <CardDescription>Người dùng báo cáo nhiều nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(topContributors) && topContributors.length > 0 ? topContributors.slice(0, 5).map((user: any, index: number) => {
                  const countValue = typeof user.count === 'object' ? user.count?.count || 0 : user.count || user.itemCount || 0;
                  
                  return (
                    <div key={user.userId || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-slate-100 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{user.userName || user.fullName}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">{countValue} đồ</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleOpenDetailDialog(user.userId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-500">Không có dữ liệu</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campus Most Lost Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Campus nhiều đồ thất lạc nhất
              </CardTitle>
              <CardDescription>Thống kê theo campus</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campus</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(campusLostItems) && campusLostItems.length > 0 ? campusLostItems.map((campus: any) => {
                    const countValue = typeof campus.count === 'object' ? campus.count?.count || 0 : campus.count || campus.lostItemCount || 0;
                    
                    return (
                      <TableRow key={campus.campusId || campus.campusName}>
                        <TableCell className="font-medium">{campus.campusName}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{countValue}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-slate-500">Không có dữ liệu</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Users Most Lost Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Người dùng báo mất nhiều nhất
              </CardTitle>
              <CardDescription>Top người báo thất lạc</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(userLostItems) && userLostItems.length > 0 ? userLostItems.slice(0, 5).map((user: any) => {
                    const countValue = typeof user.count === 'object' ? user.count?.count || 0 : user.count || user.lostItemCount || 0;
                    
                    return (
                      <TableRow key={user.userId || user.userName}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.userName || user.fullName}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-purple-600">{countValue}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleOpenDetailDialog(user.userId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-500">Không có dữ liệu</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : userDetail ? (
            <div className="space-y-4">
              {userDetail.studentIdCardUrl && (
                <div className="flex justify-center">
                  <img 
                    src={userDetail.studentIdCardUrl} 
                    alt="Hình thẻ sinh viên" 
                    className="max-h-64 rounded-lg border"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">ID</p>
                  <p className="font-medium">{userDetail.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Username</p>
                  <p className="font-medium">{userDetail.username}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Họ và tên</p>
                  <p className="font-medium">{userDetail.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{userDetail.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Số điện thoại</p>
                  <p className="font-medium">{userDetail.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vai trò</p>
                  <p className="font-medium">{userDetail.roleName || userDetail.role}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Campus</p>
                  <p className="font-medium">{userDetail.campusName || 'Chưa xác định'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Trạng thái</p>
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
    </>
  );
};

export default AdminDashboard;