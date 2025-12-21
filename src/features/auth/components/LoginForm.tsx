import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginMutation } from '../authApi';
import { useGetCampusesQuery } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '../authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

const loginSchema = z.object({
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Google icon component
const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

export const LoginForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const currentUser = useAppSelector(selectCurrentUser);

    const [login, { isLoading }] = useLoginMutation();
    const { data: campuses = [], isLoading: loadingCampuses } = useGetCampusesQuery();
    
    const [selectedCampusId, setSelectedCampusId] = useState<string>("");
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Listen for user change in Redux
    useEffect(() => {
        if (currentUser?.role) {
            console.log("✅ User updated in Redux:", currentUser);
            console.log("✅ User role:", currentUser.role, "Type:", typeof currentUser.role);

            const userRole = currentUser.role;
            let redirectPath = '/items';

            if (userRole === 'ADMIN') {
                redirectPath = '/admin/dashboard';
                console.log("🔄 Redirecting ADMIN to:", redirectPath);
            } else if (userRole === 'SECURITY') {
                redirectPath = '/security/dashboard';
                console.log("🔄 Redirecting SECURITY to:", redirectPath);
            } else if (userRole === 'STAFF') {
                redirectPath = '/staff/dashboard';
                console.log("🔄 Redirecting STAFF to:", redirectPath);
            } else {
                console.log("🔄 Redirecting", userRole, "to:", redirectPath);
            }

            // Small delay to ensure Redux store is fully synced
            setTimeout(() => {
                toast({
                    title: "Đăng nhập thành công!",
                    description: `Xin chào ${currentUser.fullName}`,
                });

                // Always redirect to role-based path, ignore 'from' to avoid permission issues
                console.log("🚀 Navigating to:", redirectPath);
                navigate(redirectPath, { replace: true });
            }, 100);
        }
    }, [currentUser, navigate, toast]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            const result = await login({
                email: values.email,
                password: values.password,
            }).unwrap();

            console.log("✅ Login successful, result:", result);
            // useEffect will handle the rest when currentUser updates in Redux

        } catch (err) {
            console.error("❌ Login error:", err);
            const error = err as FetchBaseQueryError | SerializedError;

            let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";

            if ("status" in error && error.status === 401) {
                errorMessage = "Sai email hoặc mật khẩu!";
            }

            if ("data" in error && error.data && typeof error.data === "object") {
                const data = error.data as { message?: string };
                if (data.message) {
                    errorMessage = data.message;
                }
            }

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            toast({
                variant: "destructive",
                title: "Đăng nhập thất bại",
                description: errorMessage,
            });
        }

    };

    const handleGoogleLogin = () => {
        if (!selectedCampusId) {
            toast({
                variant: "destructive",
                title: "Vui lòng chọn Campus",
                description: "Bạn cần chọn cơ sở trước khi đăng nhập bằng Google.",
            });
            return;
        }

        setIsGoogleLoading(true);
        
        // Redirect to BE Google OAuth endpoint
        const apiUrl = import.meta.env.VITE_API_URL || 'https://be-xtt0.onrender.com/api';
        const googleLoginUrl = `${apiUrl}/auth/google-login?campusId=${selectedCampusId}`;
        
        console.log("🔄 Redirecting to Google OAuth:", googleLoginUrl);
        window.location.href = googleLoginUrl;
    };

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập hệ thống</h1>
                <p className="text-sm text-muted-foreground">
                    Chọn cơ sở và đăng nhập bằng tài khoản FPT
                </p>
            </div>

            {/* Campus Selection for Google Login */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Chọn Campus</label>
                <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn cơ sở của bạn" />
                    </SelectTrigger>
                    <SelectContent>
                        {loadingCampuses ? (
                            <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                        ) : (
                            campuses.map((campus) => (
                                <SelectItem key={campus.campusId} value={String(campus.campusId)}>
                                    {campus.campusName}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Google Login Button */}
            <Button 
                type="button"
                variant="outline" 
                className="w-full h-11 gap-3 border-slate-300 hover:bg-slate-50"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || !selectedCampusId}
            >
                {isGoogleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                Đăng nhập bằng Google
            </Button>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Hoặc đăng nhập bằng email
                    </span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@fpt.edu.vn" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* PASSWORD */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Đăng nhập
                    </Button>
                </form>
            </Form>

            {/* FOOTER */}
            <div className="text-center text-xs text-muted-foreground">
                Quên mật khẩu? Vui lòng liên hệ IT Campus.
            </div>
        </div>
    );
};