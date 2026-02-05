import { useState } from 'react';
import { useStaff } from '../context/StaffContext';
import Header from '../components/Layout/Header';
import PlusButton from '../components/Layout/PlusButton';
import MonthlyView from '../components/Calendar/MonthlyView';
import WeeklyView from '../components/Calendar/WeeklyView';
import ShiftModal from '../components/Calendar/ShiftModal';
import DayDetailModal from '../components/Calendar/DayDetailModal';
import StaffList from '../components/Staff/StaffList';
import QuotaDashboard from '../components/Staff/QuotaDashboard';

export default function HomePage() {
  const { staffs, currentStaff, loading } = useStaff();
  const [view, setView] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [shiftDate, setShiftDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftFilter, setShiftFilter] = useState('all');

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAddShift = (date) => {
    setSelectedDate(null);
    setShiftDate(date);
    setSelectedShift(null);
  };

  const handleEditShift = (shift) => {
    setSelectedDate(null);
    setShiftDate(new Date(shift.date + 'T00:00:00'));
    setSelectedShift(shift);
  };

  const handleCloseShiftModal = () => {
    setShiftDate(null);
    setSelectedShift(null);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatWeekRange = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {staffs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Staff Rotations</h2>
            <p className="text-gray-500 mb-4">
              Create a new staff or join an existing one to get started.
            </p>
            <p className="text-sm text-gray-400">
              Click the + button to begin
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => view === 'monthly' ? navigateMonth(-1) : navigateWeek(-1)}
                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                >
                  &larr;
                </button>
                <h2 className="text-lg font-semibold text-gray-800 min-w-[200px] text-center">
                  {view === 'monthly' ? formatMonthYear() : formatWeekRange()}
                </h2>
                <button
                  onClick={() => view === 'monthly' ? navigateMonth(1) : navigateWeek(1)}
                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                >
                  &rarr;
                </button>
                <button
                  onClick={goToToday}
                  className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setShiftFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      shiftFilter === 'all'
                        ? 'bg-white shadow text-gray-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setShiftFilter('mine')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      shiftFilter === 'mine'
                        ? 'bg-white shadow text-gray-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Mine
                  </button>
                </div>

                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setView('monthly')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      view === 'monthly'
                        ? 'bg-white shadow text-gray-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setView('weekly')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      view === 'weekly'
                        ? 'bg-white shadow text-gray-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                {view === 'monthly' ? (
                  <MonthlyView currentDate={currentDate} onDateClick={handleDateClick} shiftFilter={shiftFilter} />
                ) : (
                  <WeeklyView currentDate={currentDate} onDateClick={handleDateClick} shiftFilter={shiftFilter} />
                )}
              </div>
              <div className="lg:col-span-1 space-y-4">
                <StaffList />
                <QuotaDashboard />
              </div>
            </div>
          </div>
        )}
      </main>

      <PlusButton />

      {selectedDate && currentStaff && (
        <DayDetailModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onAddShift={handleAddShift}
          onEditShift={handleEditShift}
        />
      )}

      {shiftDate && currentStaff && (
        <ShiftModal
          date={shiftDate}
          shift={selectedShift}
          onClose={handleCloseShiftModal}
        />
      )}
    </div>
  );
}
