import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">GuardApp</h1>
        <p className="text-gray-600 mt-2">Medical Student Shift Scheduler</p>
      </div>
      <RegisterForm
        onSuccess={() => navigate('/')}
        onSwitchToLogin={() => navigate('/login')}
      />
    </div>
  );
}
