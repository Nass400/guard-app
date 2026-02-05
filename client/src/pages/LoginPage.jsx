import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">GuardApp</h1>
        <p className="text-gray-600 mt-2">Medical Student Shift Scheduler</p>
      </div>
      <LoginForm
        onSuccess={() => navigate('/')}
        onSwitchToRegister={() => navigate('/register')}
      />
    </div>
  );
}
