
import { LoginHero } from '@/features/auth/components/LoginHero';
import { LoginForm } from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* --- LEFT SIDE: HERO IMAGE --- */}
      <LoginHero />

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="lg:p-8">
        <LoginForm />
      </div>

    </div>
  );
};

export default LoginPage;