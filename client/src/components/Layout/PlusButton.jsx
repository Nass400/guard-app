import { useState } from 'react';
import CreateStaffForm from '../Staff/CreateStaffForm';
import JoinStaffForm from '../Staff/JoinStaffForm';

export default function PlusButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null);

  const handleClose = () => {
    setIsOpen(false);
    setMode(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center text-3xl font-light"
      >
        +
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            {!mode ? (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Staff</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setMode('create')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                  >
                    <div className="font-semibold text-gray-800">Create New Staff</div>
                    <div className="text-sm text-gray-500">Create a rotation and invite colleagues</div>
                  </button>
                  <button
                    onClick={() => setMode('join')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                  >
                    <div className="font-semibold text-gray-800">Join Existing Staff</div>
                    <div className="text-sm text-gray-500">Enter a 6-character code to join</div>
                  </button>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : mode === 'create' ? (
              <CreateStaffForm onClose={handleClose} onBack={() => setMode(null)} />
            ) : (
              <JoinStaffForm onClose={handleClose} onBack={() => setMode(null)} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
