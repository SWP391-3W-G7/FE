import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReturnCounter } from '@/features/items/components/ReturnCounter';
import { ReturnClaimList } from '@/features/items/components/ReturnClaimList';
import { ArrowLeftRight, FileCheck } from 'lucide-react';

const StaffReturnPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trả đồ</h1>
                <p className="text-slate-500 mt-1">Quản lý quy trình trả đồ vật cho chủ sở hữu.</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Tabs defaultValue="matching" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-slate-50">
                            <TabsTrigger
                                value="matching"
                                className="flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-white data-[state=active]:shadow-none"
                            >
                                <ArrowLeftRight className="w-4 h-4" />
                                Matching
                            </TabsTrigger>
                            <TabsTrigger
                                value="claims"
                                className="flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-none"
                            >
                                <FileCheck className="w-4 h-4" />
                                Claims
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="matching" className="p-6 mt-0">
                            <ReturnCounter />
                        </TabsContent>

                        <TabsContent value="claims" className="p-6 mt-0">
                            <ReturnClaimList />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffReturnPage;
