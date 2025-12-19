import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginMutation } from '../authApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '../authSlice';
import { type UserRole } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { ROLES } from '@/config/roles';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

const loginSchema = z.object({
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const currentUser = useAppSelector(selectCurrentUser);

    const [login, { isLoading }] = useLoginMutation();

    // Listen for user change in Redux
    useEffect(() => {
        if (currentUser?.role) {
            console.log("✅ User updated in Redux:", currentUser);
            console.log("✅ User role:", currentUser.role, "Type:", typeof currentUser.role);

            const userRole = currentUser.role as UserRole;
            let redirectPath = '/items';

            if (userRole === ROLES.ADMIN) {
                redirectPath = '/admin/dashboard';
                console.log("🔄 Redirecting ADMIN to:", redirectPath);
            } else if (userRole === ROLES.SECURITY || userRole === 'SECURITY') {
                redirectPath = '/security/dashboard';
                console.log("🔄 Redirecting SECURITY to:", redirectPath);
            } else if (userRole === ROLES.STAFF) {
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

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập hệ thống</h1>
                <p className="text-sm text-muted-foreground">
                    Chọn cơ sở và đăng nhập bằng tài khoản được cấp
                </p>
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
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Hỗ trợ kỹ thuật
                    </span>
                </div>
            </div>
            <div className="text-center text-xs text-muted-foreground">
                Quên mật khẩu? Vui lòng liên hệ IT Campus.
            </div>
        </div>
    );
};