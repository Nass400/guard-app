import { useAuth } from '../../context/AuthContext';
import { useStaff } from '../../context/StaffContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { staffs, currentStaff, setCurrentStaff } = useStaff();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-600">GuardApp</h1>

          {staffs.length > 0 && (
            <select
              value={currentStaff?.id || ''}
              onChange={(e) => {
                const staff = staffs.find(s => s.id === e.target.value);
                setCurrentStaff(staff);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {staffs.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.hospital}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
