import { useMemo } from 'react';
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

export default function MonthlyView({ currentDate, onDateClick, shiftFilter }) {
  const { shifts, currentStaffDetails } = useStaff();
  const { user } = useAuth();

  const memberColorMap = useMemo(() => {
    const map = {};
    currentStaffDetails?.members?.forEach((member, index) => {
      map[member.id] = MEMBER_COLORS[index % MEMBER_COLORS.length];
    });
    return map;
  }, [currentStaffDetails]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startDayOfWeek = firstDay.getDay();

    // Add days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const getShiftsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(s => s.date === dateStr && (shiftFilter === 'all' || s.userId === user?.id));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map(day => (
          <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dayShifts = getShiftsForDate(date);
          const today = isToday(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={`min-h-[100px] p-1 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              }`}
            >
              <div className={`text-sm mb-1 ${
                today
                  ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto'
                  : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {date.getDate()}
              </div>

              <div className="space-y-1">
                {dayShifts.slice(0, 3).map(shift => {
                  const isOwnShift = shift.userId === user?.id;
                  const colorClass = memberColorMap[shift.userId] || 'bg-gray-100 border-gray-300 text-gray-800';

                  return (
                    <div
                      key={shift.id}
                      className={`text-xs px-1 py-0.5 rounded border truncate ${colorClass} ${
                        isOwnShift ? 'ring-2 ring-blue-500' : ''
                      }`}
                      title={`${shift.user?.firstName} ${shift.user?.lastName} - ${shift.startTime} to ${shift.endTime}`}
                    >
                      {shift.user?.firstName?.[0]}{shift.user?.lastName?.[0]} {shift.startTime}
                    </div>
                  );
                })}
                {dayShifts.length > 3 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayShifts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
