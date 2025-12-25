import { useState } from "react";
import {
  useGetUnreturnedItemsCountQuery,
  useGetFoundItemsMonthlyQuery,
  useGetTopContributorQuery,
  useGetCampusMostLostItemsQuery,
  useGetUserMostLostItemsQuery,
  useGetLostItemsStatusStatsQuery,
  useGetFoundItemsStatusStatsQuery,
  useGetClaimStatusStatsQuery,
  useGetUserDetailQuery,
  useGetCampusesQuery,
} from "@/features/items/itemApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Package,
  FileQuestion,
  CheckCircle2,
  MapPin,
  Users,
  TrendingUp,
  Trophy,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminDashboard = () => {
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUserIdForDetail, setSelectedUserIdForDetail] = useState<
    number | null
  >(null);

  const { data: campuses = [], isLoading: loadingCampuses } = useGetCampusesQuery();
  
  const { data: unreturnedCount, isLoading: loadingUnreturned } =
    useGetUnreturnedItemsCountQuery(selectedCampusId);
  const { data: monthlyData, isLoading: loadingMonthly } =
    useGetFoundItemsMonthlyQuery(selectedCampusId);
  const { data: topContributors, isLoading: loadingContributors } =
    useGetTopContributorQuery(selectedCampusId);
  const { data: campusLostItems, isLoading: loadingCampusLost } =
    useGetCampusMostLostItemsQuery();
  const { data: userLostItems, isLoading: loadingUserLost } =
    useGetUserMostLostItemsQuery(selectedCampusId);
  const { data: lostItemsStats, isLoading: loadingLostStats } =
    useGetLostItemsStatusStatsQuery(selectedCampusId);
  const { data: foundItemsStats, isLoading: loadingFoundStats } =
    useGetFoundItemsStatusStatsQuery(selectedCampusId);
  const { data: claimStats, isLoading: loadingClaimStats } =
    useGetClaimStatusStatsQuery(selectedCampusId);

  const { data: userDetail, isLoading: isLoadingDetail } =
    useGetUserDetailQuery(selectedUserIdForDetail!, {
      skip: selectedUserIdForDetail === null,
    });

  const handleOpenDetailDialog = (userId: number) => {
    setSelectedUserIdForDetail(userId);
    setDetailDialogOpen(true);
  };

  // Helper functions for data extraction
  const getCountValue = (item: any): number => {
    return typeof item?.count === "object"
      ? item.count?.count || 0
      : item?.count || 0;
  };

  const getTotalCount = (stats: any[]): number => {
    if (!Array.isArray(stats)) return 0;
    return stats.reduce((sum, stat) => sum + getCountValue(stat), 0);
  };

  const getStatusColor = (status: string, type: "lost" | "found" | "claim") => {
    const statusLower = status?.toLowerCase() || "";

    if (type === "lost") {
      if (statusLower.includes("open") || statusLower.includes("lost"))
        return "bg-orange-500";
      if (statusLower.includes("closed")) return "bg-gray-400";
      if (statusLower.includes("found") || statusLower.includes("match"))
        return "bg-green-500";
      return "bg-blue-500";
    }

    if (type === "found") {
      if (statusLower.includes("open")) return "bg-orange-500";
      if (statusLower.includes("stored")) return "bg-blue-500";
      if (statusLower.includes("returned")) return "bg-green-500";
      if (statusLower.includes("claimed")) return "bg-yellow-500";
      return "bg-gray-400";
    }

    if (type === "claim") {
      if (statusLower.includes("pending"))
        return { bg: "bg-orange-500", hex: "#f97316" };
      if (statusLower.includes("approved"))
        return { bg: "bg-green-500", hex: "#22c55e" };
      if (statusLower.includes("rejected"))
        return { bg: "bg-red-500", hex: "#ef4444" };
      if (statusLower.includes("returned"))
        return { bg: "bg-blue-500", hex: "#3b82f6" };
      if (statusLower.includes("conflicted"))
        return { bg: "bg-purple-500", hex: "#a855f7" };
      return { bg: "bg-gray-400", hex: "#9ca3af" };
    }

    return "bg-gray-400";
  };

  // Calculate totals for KPI cards
  const totalLostItems = getTotalCount(lostItemsStats || []);
  const totalFoundItems = getTotalCount(foundItemsStats || []);
  const totalClaims = getTotalCount(claimStats || []);

  const isLoading =
    loadingCampuses ||
    loadingUnreturned ||
    loadingMonthly ||
    loadingContributors ||
    loadingCampusLost ||
    loadingUserLost ||
    loadingLostStats ||
    loadingFoundStats ||
    loadingClaimStats;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-20 w-full mb-8 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Campus Filter */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Tổng quan hệ thống Lost & Found
              </p>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedCampusId?.toString() || "all"}
                onValueChange={(value) => setSelectedCampusId(value === "all" ? null : Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                      {campus.campusName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Unreturned Items */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Đồ chưa trả
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {unreturnedCount || 0}
                  </span>
                  <span className="text-sm text-slate-500">items</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-300"
                  >
                    Cần xử lý
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Đồ nhặt được chưa được trả cho chủ nhân
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lost Items */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-red-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Đồ thất lạc
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FileQuestion className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {totalLostItems}
                  </span>
                  <span className="text-sm text-slate-500">reports</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Tổng báo cáo</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Người dùng báo cáo mất đồ
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Found Items */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Đồ nhặt được
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {totalFoundItems}
                  </span>
                  <span className="text-sm text-slate-500">items</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trong kho</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Đồ được nhặt và báo cáo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Claims */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Yêu cầu nhận đồ
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {totalClaims}
                  </span>
                  <span className="text-sm text-slate-500">claims</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Đã xử lý</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Yêu cầu nhận lại đồ thất lạc
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Lost Items Status */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Trạng thái đồ thất lạc
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Phân bổ theo trạng thái
                  </CardDescription>
                </div>
                <FileQuestion className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray(lostItemsStats) && lostItemsStats.length > 0 ? (
                <div className="space-y-3">
                  {lostItemsStats.map((stat: any) => {
                    const statusValue =
                      stat.status || stat.statusName || stat.scope;
                    const countValue = getCountValue(stat);
                    const percentage =
                      totalLostItems > 0
                        ? ((countValue / totalLostItems) * 100).toFixed(1)
                        : "0";
                    const widthPercent =
                      totalLostItems > 0
                        ? (countValue / totalLostItems) * 100
                        : 0;

                    return (
                      <div key={statusValue} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {statusValue}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {percentage}%
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {countValue}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getStatusColor(statusValue, "lost")} transition-all duration-500 rounded-full`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Minus className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Found Items Status */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Trạng thái đồ nhặt được
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Phân bổ theo trạng thái
                  </CardDescription>
                </div>
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray(foundItemsStats) && foundItemsStats.length > 0 ? (
                <div className="space-y-3">
                  {foundItemsStats.map((stat: any) => {
                    const statusValue =
                      stat.status || stat.statusName || stat.scope;
                    const countValue = getCountValue(stat);
                    const percentage =
                      totalFoundItems > 0
                        ? ((countValue / totalFoundItems) * 100).toFixed(1)
                        : "0";
                    const widthPercent =
                      totalFoundItems > 0
                        ? (countValue / totalFoundItems) * 100
                        : 0;

                    return (
                      <div key={statusValue} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {statusValue}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {percentage}%
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {countValue}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getStatusColor(statusValue, "found")} transition-all duration-500 rounded-full`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Minus className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claim Status - Donut Chart */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Trạng thái yêu cầu
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Phân bổ theo trạng thái
                  </CardDescription>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray(claimStats) && claimStats.length > 0 ? (
                <div className="space-y-4">
                  {/* Donut Chart */}
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full transform -rotate-90"
                      >
                        {(() => {
                          const total = getTotalCount(claimStats);
                          if (total === 0) return null;

                          let currentAngle = 0;
                          const strokeWidth = 40;

                          return claimStats.map((stat: any) => {
                            const statusValue =
                              stat.status || stat.statusName || stat.scope;
                            const countValue = getCountValue(stat);
                            const angle = (countValue / total) * 360;
                            const colors = getStatusColor(statusValue, "claim");
                            const color =
                              typeof colors === "object"
                                ? colors.hex
                                : "#9ca3af";

                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            currentAngle = endAngle;

                            const startRad = startAngle * (Math.PI / 180);
                            const endRad = endAngle * (Math.PI / 180);
                            const radius = 80;
                            const x1 = 100 + radius * Math.cos(startRad);
                            const y1 = 100 + radius * Math.sin(startRad);
                            const x2 = 100 + radius * Math.cos(endRad);
                            const y2 = 100 + radius * Math.sin(endRad);
                            const largeArc = angle > 180 ? 1 : 0;

                            const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

                            return (
                              <path
                                key={statusValue}
                                d={pathD}
                                fill="none"
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                className="transition-opacity hover:opacity-80"
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">
                          {totalClaims}
                        </span>
                        <span className="text-xs text-slate-500">Tổng</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2">
                    {claimStats.map((stat: any) => {
                      const statusValue =
                        stat.status || stat.statusName || stat.scope;
                      const countValue = getCountValue(stat);
                      const percentage =
                        totalClaims > 0
                          ? ((countValue / totalClaims) * 100).toFixed(1)
                          : "0";
                      const colors = getStatusColor(statusValue, "claim");
                      const bgColor =
                        typeof colors === "object" ? colors.bg : "bg-gray-400";

                      return (
                        <div
                          key={statusValue}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${bgColor}`}
                            ></div>
                            <span className="text-slate-700 text-xs">
                              {statusValue}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {percentage}%
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {countValue}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Minus className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Không có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trends and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend Chart */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Xu hướng đồ nhặt được
                  </CardTitle>
                  <CardDescription className="text-sm">
                    12 tháng gần nhất
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray(monthlyData) && monthlyData.length > 0 ? (
                <div className="space-y-4">
                  {/* Area Chart */}
                  <svg viewBox="0 0 600 250" className="w-full h-64">
                    {/* Grid */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <g key={i}>
                        <line
                          x1="60"
                          y1={40 + i * 40}
                          x2="580"
                          y2={40 + i * 40}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                        <text
                          x="45"
                          y={45 + i * 40}
                          fontSize="11"
                          fill="#94a3b8"
                          textAnchor="end"
                        >
                          {(() => {
                            const maxValue = Math.max(
                              ...monthlyData.map((item: any) =>
                                getCountValue(item),
                              ),
                              1,
                            );
                            return Math.round((4 - i) * (maxValue / 4));
                          })()}
                        </text>
                      </g>
                    ))}

                    {/* Chart */}
                    {(() => {
                      const maxValue = Math.max(
                        ...monthlyData.map((item: any) => getCountValue(item)),
                        1,
                      );
                      const chartHeight = 160;
                      const chartWidth = 520;
                      const xStep = chartWidth / (monthlyData.length - 1 || 1);

                      const points = monthlyData.map(
                        (item: any, index: number) => {
                          const countValue = getCountValue(item);
                          const x = 60 + index * xStep;
                          const y = 200 - (countValue / maxValue) * chartHeight;
                          return {
                            x,
                            y,
                            count: countValue,
                            month: item.month || item.name,
                          };
                        },
                      );

                      const linePathD = points
                        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                        .join(" ");
                      const areaPathD = `M 60 200 ${linePathD} L ${points[points.length - 1].x} 200 Z`;

                      const maxPoint = points.reduce(
                        (max, p) => (p.count > max.count ? p : max),
                        points[0],
                      );

                      return (
                        <>
                          <defs>
                            <linearGradient
                              id="areaGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity="0.3"
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity="0.05"
                              />
                            </linearGradient>
                          </defs>

                          <path d={areaPathD} fill="url(#areaGradient)" />
                          <path
                            d={linePathD}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {points.map((p, i) => (
                            <g key={i}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill="white"
                                stroke="#3b82f6"
                                strokeWidth="2"
                              />
                              {p.x === maxPoint.x && (
                                <g>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="6"
                                    fill="#3b82f6"
                                    opacity="0.2"
                                  />
                                  <text
                                    x={p.x}
                                    y={p.y - 15}
                                    fontSize="11"
                                    fill="#3b82f6"
                                    fontWeight="600"
                                    textAnchor="middle"
                                  >
                                    {p.count}
                                  </text>
                                </g>
                              )}
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
                          y="230"
                          fontSize="10"
                          fill="#64748b"
                          textAnchor="middle"
                        >
                          {item.month || item.name}
                        </text>
                      );
                    })}
                  </svg>

                  <div className="flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-600">Đồ nhặt được</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Không có dữ liệu xu hướng
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top người đóng góp
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Người dùng báo cáo nhiều nhất
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray(topContributors) && topContributors.length > 0 ? (
                <div className="space-y-3">
                  {topContributors
                    .slice(0, 5)
                    .map((user: any, index: number) => {
                      const countValue = user.itemCount || getCountValue(user);

                      const rankStyles = [
                        {
                          bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
                          text: "text-white",
                          icon: "🥇",
                        },
                        {
                          bg: "bg-gradient-to-br from-slate-300 to-slate-500",
                          text: "text-white",
                          icon: "🥈",
                        },
                        {
                          bg: "bg-gradient-to-br from-orange-400 to-orange-600",
                          text: "text-white",
                          icon: "🥉",
                        },
                        {
                          bg: "bg-slate-100",
                          text: "text-slate-700",
                          icon: index + 1,
                        },
                        {
                          bg: "bg-slate-100",
                          text: "text-slate-700",
                          icon: index + 1,
                        },
                      ];

                      const style = rankStyles[index] || {
                        bg: "bg-slate-100",
                        text: "text-slate-700",
                        icon: index + 1,
                      };

                      return (
                        <div
                          key={user.userId || index}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${style.bg} ${style.text} shadow-sm`}
                            >
                              {style.icon}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {user.userName || user.fullName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500 text-white font-semibold">
                              {countValue} đồ
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleOpenDetailDialog(user.userId)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Chưa có người đóng góp
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rankings and Risk Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* High-Risk Campuses */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Campus có nhiều thất lạc
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Khu vực cần chú ý
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray(campusLostItems) && campusLostItems.length > 0 ? (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Campus</TableHead>
                        <TableHead className="text-right font-semibold">
                          Số lượng
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Mức độ
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campusLostItems.map((campus: any) => {
                        const countValue =
                          campus.lostItemCount || getCountValue(campus);
                        const maxCount = Math.max(
                          ...campusLostItems.map(
                            (c: any) => c.lostItemCount || getCountValue(c),
                          ),
                        );
                        const riskLevel =
                          countValue > maxCount * 0.7
                            ? "high"
                            : countValue > maxCount * 0.4
                              ? "medium"
                              : "low";

                        return (
                          <TableRow
                            key={campus.campusId || campus.campusName}
                            className="hover:bg-slate-50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${riskLevel === "high"
                                      ? "bg-red-500"
                                      : riskLevel === "medium"
                                        ? "bg-orange-500"
                                        : "bg-green-500"
                                    }`}
                                />
                                <span className="font-medium text-slate-900">
                                  {campus.campusName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-lg font-bold text-slate-900">
                                {countValue}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {riskLevel === "high" ? (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Cao
                                </Badge>
                              ) : riskLevel === "medium" ? (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600 border-orange-300 gap-1"
                                >
                                  <ArrowUpRight className="h-3 w-3" />
                                  Trung bình
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-300 gap-1"
                                >
                                  <ArrowDownRight className="h-3 w-3" />
                                  Thấp
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Không có dữ liệu campus
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Lost Reporters */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5 text-purple-500" />
                    Người báo mất nhiều nhất
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Cần hỗ trợ và theo dõi
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray(userLostItems) && userLostItems.length > 0 ? (
                <div className="space-y-3">
                  {userLostItems.slice(0, 5).map((user: any, index: number) => {
                    const countValue =
                      user.lostItemCount || getCountValue(user);

                    const rankStyles = [
                      {
                        bg: "bg-gradient-to-br from-purple-400 to-purple-600",
                        text: "text-white",
                        icon: "1",
                      },
                      {
                        bg: "bg-gradient-to-br from-purple-300 to-purple-500",
                        text: "text-white",
                        icon: "2",
                      },
                      {
                        bg: "bg-gradient-to-br from-purple-200 to-purple-400",
                        text: "text-white",
                        icon: "3",
                      },
                      {
                        bg: "bg-purple-100",
                        text: "text-purple-700",
                        icon: index + 1,
                      },
                      {
                        bg: "bg-purple-100",
                        text: "text-purple-700",
                        icon: index + 1,
                      },
                    ];

                    const style = rankStyles[index] || {
                      bg: "bg-purple-100",
                      text: "text-purple-700",
                      icon: index + 1,
                    };

                    return (
                      <div
                        key={user.userId || user.userName}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${style.bg} ${style.text} shadow-sm`}
                          >
                            {style.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {user.userName || user.fullName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-500 text-white font-semibold">
                            {countValue} reports
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetailDialog(user.userId)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Không có dữ liệu người dùng
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Thông tin chi tiết người dùng
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          ) : userDetail ? (
            <div className="space-y-6 py-4">
              {/* Student ID Card Image */}
              {userDetail.studentIdCardUrl && (
                <div className="flex justify-center bg-slate-50 rounded-lg p-4">
                  <img
                    src={userDetail.studentIdCardUrl}
                    alt="Thẻ sinh viên"
                    className="max-h-72 rounded-lg border-2 border-slate-200 shadow-md object-contain"
                  />
                </div>
              )}

              {/* User Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    User ID
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {userDetail.userId}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    Username
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {userDetail.username}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    Họ và tên
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {userDetail.fullName}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    Email
                  </p>
                  <p className="text-base font-semibold text-slate-900 break-all">
                    {userDetail.email}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    Số điện thoại
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {userDetail.phoneNumber || (
                      <span className="text-slate-400 italic">
                        Chưa cập nhật
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    Vai trò
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {userDetail.role || (userDetail as any).roleName || (
                      <span className="text-slate-400 italic">
                        Chưa xác định
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    Campus
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {userDetail.campusName || (
                      <span className="text-slate-400 italic">
                        Chưa xác định
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                    Trạng thái
                  </p>
                  <div className="mt-1">
                    {userDetail.status === "Active" ? (
                      <Badge className="bg-green-500 text-white gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Hoạt động
                      </Badge>
                    ) : userDetail.status === "Pending" ? (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-300 gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Chờ duyệt
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600 gap-1">
                        <Minus className="h-3 w-3" />
                        Không hoạt động
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                Không thể tải thông tin người dùng
              </p>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
