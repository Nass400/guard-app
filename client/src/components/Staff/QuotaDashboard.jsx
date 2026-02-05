import { useStaff } from '../../context/StaffContext';

export default function QuotaDashboard() {
  const { quotaDashboard, currentStaffDetails } = useStaff();

  if (!currentStaffDetails || quotaDashboard.length === 0) {
    return null;
  }

  const sorted = [...quotaDashboard].sort((a, b) => b.totalQuota - a.totalQuota);
  const maxQuota = sorted[0]?.totalQuota || 1;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Quota Dashboard</h3>
      <div className="space-y-3">
        {sorted.map(member => (
          <div key={member.userId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {member.firstName} {member.lastName}
              </span>
              <span className="text-gray-500">
                {member.totalQuota} pts ({member.shiftCount} shifts)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${maxQuota > 0 ? (member.totalQuota / maxQuota) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
