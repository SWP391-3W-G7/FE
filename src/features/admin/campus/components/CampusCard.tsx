import { Building2, MapPin, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campus } from '@/types';

interface CampusCardProps {
    campus: Campus;
    onEdit: (campus: Campus) => void;
    onDelete: (campus: Campus) => void;
}

export const CampusCard = ({ campus, onEdit, onDelete }: CampusCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">{campus.campusName}</CardTitle>
                            <Badge variant="outline" className="mt-1 text-[10px] bg-slate-50">ID: {campus.campusId}</Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-slate-700">Địa chỉ:</p>
                            <p className="leading-tight">{campus.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-slate-700">Vị trí lưu trữ:</p>
                            <p className="leading-tight">{campus.storageLocation}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                        onClick={() => onEdit(campus)}
                    >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Sửa
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-red-600 border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        onClick={() => onDelete(campus)}
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Xóa
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
