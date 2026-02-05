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

export default function WeeklyView({ currentDate, onDateClick, shiftFilter }) {
  const { shifts, currentStaffDetails } = useStaff();
  const { user } = useAuth();

  const memberColorMap = useMemo(() => {
    const map = {};
    currentStaffDetails?.members?.forEach((member, index) => {
      map[member.id] = MEMBER_COLORS[index % MEMBER_COLORS.length];
    });
    return map;
  }, [currentStaffDetails]);

  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
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

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-7">
        {weekDays.map((date, index) => {
          const dayShifts = getShiftsForDate(date);
          const today = isToday(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={`min-h-[300px] border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                today ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className={`p-2 border-b border-gray-200 text-center ${
                today ? 'bg-blue-100' : 'bg-gray-50'
              }`}>
                <div className="text-xs text-gray-500">{dayNames[date.getDay()]}</div>
                <div className={`text-lg font-semibold ${today ? 'text-blue-600' : 'text-gray-800'}`}>
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-400">{monthNames[date.getMonth()]}</div>
              </div>

              <div className="p-2 space-y-2">
                {dayShifts.map(shift => {
                  const isOwnShift = shift.userId === user?.id;
                  const colorClass = memberColorMap[shift.userId] || 'bg-gray-100 border-gray-300 text-gray-800';

                  return (
                    <div
                      key={shift.id}
                      className={`p-2 rounded-lg border ${colorClass} ${
                        isOwnShift ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {shift.user?.firstName} {shift.user?.lastName}
                      </div>
                      <div className="text-xs mt-1">
                        {shift.startTime} - {shift.endTime}
                      </div>
                      {shift.notes && (
                        <div className="text-xs mt-1 opacity-75 truncate">
                          {shift.notes}
                        </div>
                      )}
                    </div>
                  );
                })}

                {dayShifts.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">
                    No shifts
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
