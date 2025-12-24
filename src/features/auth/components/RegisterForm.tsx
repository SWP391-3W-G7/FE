import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useRegisterMutation } from '../authApi';
import { useGetCampusesQuery } from '@/features/items/itemApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username phải có ít nhất 3 ký tự" }),
  fullName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  phoneNumber: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: "Số điện thoại không hợp lệ" }),
  campusId: z.string().min(1, "Vui lòng chọn cơ sở"),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
  confirmPassword: z.string(),
  studentIdCard: z.instanceof(FileList).optional().refine(
    (files) => !files || files.length === 0 || files[0].size <= 5000000,
    { message: "Ảnh thẻ sinh viên không được vượt quá 5MB" }
  ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [register, { isLoading }] = useRegisterMutation();
  const { data: campuses = [] } = useGetCampusesQuery();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      campusId: "",
      password: "",
      confirmPassword: "",
      studentIdCard: undefined,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Tạo FormData để gửi multipart/form-data
      const formData = new FormData();
      formData.append('Username', values.username);
      formData.append('Email', values.email);
      formData.append('Password', values.password);
      formData.append('FullName', values.fullName);
      formData.append('CampusId', values.campusId);
      formData.append('PhoneNumber', values.phoneNumber);

      // Thêm file ảnh thẻ sinh viên nếu có
      if (values.studentIdCard && values.studentIdCard.length > 0) {
        formData.append('studentIdCard', values.studentIdCard[0]);
      }

      await register(formData).unwrap();

      toast({
        title: "Đăng ký thành công!",
        description: "Vui lòng đăng nhập để tiếp tục.",
      });

      navigate('/login');

    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || "Email này có thể đã tồn tại.";
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản mới</h1>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin cá nhân để đăng ký
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="nguyenvana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="campusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cơ sở (Campus)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nơi bạn đang học" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.campusId} value={String(campus.campusId)}>
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
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0909xxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentIdCard"
            render={({ field: { onChange, ref } }) => (
              <FormItem>
                <FormLabel>Ảnh thẻ sinh viên (tùy chọn)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    ref={ref}
                    value={undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhập lại MK</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng ký tài khoản
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link to="/login" className="underline underline-offset-4 hover:text-primary text-orange-600 font-medium">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};