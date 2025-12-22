import { useAppSelector } from '@/store';
import { selectCurrentUser } from '../authSlice';

export const useStudentVerification = () => {
    const user = useAppSelector(selectCurrentUser);

    // Check if user is a student and has uploaded their ID card
    const isStudent = user?.role === 'STUDENT';
    const isVerified = !isStudent || !!user?.studentIdCardUrl;

    return {
        isStudent,
        isVerified,
        studentIdCardUrl: user?.studentIdCardUrl,
        user
    };
};
