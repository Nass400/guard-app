import { useState, useMemo } from 'react';
import { useStaff } from '../../context/StaffContext';
import { useAuth } from '../../context/AuthContext';

const MEMBER_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
];

export default function DayDetailModal({ date, onClose, onAddShift, onEditShift }) {
  const { shifts, currentStaffDetails, isModerator, getQuotaForDate, updateQuota } = useStaff();
  const { user } = useAuth();

  const dateStr = date.toISOString().split('T')[0];
  const currentQuota = getQuotaForDate(dateStr);

  const [quotaInput, setQuotaInput] = useState(currentQuota);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const memberColorMap = useMemo(() => {
    const map = {};
    currentStaffDetails?.members?.forEach((member, index) => {
      map[member.id] = MEMBER_COLORS[index % MEMBER_COLORS.length];
    });
    return map;
  }, [currentStaffDetails]);

  const dayShifts = shifts.filter(s => s.date === dateStr);

  const formatDate = (d) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveQuota = async () => {
    const value = parseFloat(quotaInput);
    if (isNaN(value) || value <= 0) {
      setError('Quota must be a positive number');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateQuota(dateStr, value);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{formatDate(date)}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Quota Section */}
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-800">Quota</span>
              {isModerator ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={quotaInput}
                    onChange={(e) => setQuotaInput(e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveQuota}
                    disabled={saving || parseFloat(quotaInput) === currentQuota}
                    className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                </div>
              ) : (
                <span className="text-lg font-bold text-amber-700">{currentQuota}</span>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>

          {/* Shifts Section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Shifts ({dayShifts.length})
            </h3>

            {dayShifts.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No shifts scheduled</p>
            ) : (
              <div className="space-y-2">
                {dayShifts.map(shift => {
                  const colorClass = memberColorMap[shift.userId] || 'bg-gray-100 border-gray-300 text-gray-800';
                  const isOwnShift = shift.userId === user?.id;

                  return (
                    <div
                      key={shift.id}
                      onClick={() => isModerator && onEditShift(shift)}
                      className={`p-3 rounded-lg border ${colorClass} ${
                        isOwnShift ? 'ring-2 ring-blue-500' : ''
                      } ${isModerator ? 'cursor-pointer hover:opacity-80' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {shift.user?.firstName} {shift.user?.lastName}
                        </span>
                        <span className="text-xs opacity-75">{shift.user?.position}</span>
                      </div>
                      <div className="text-xs mt-1">
                        {shift.startTime} - {shift.endTime}
                      </div>
                      {shift.notes && (
                        <div className="text-xs mt-1 opacity-75">{shift.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Creator Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Close
            </button>
            {isModerator && (
              <button
                onClick={() => onAddShift(date)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Add Shift
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
