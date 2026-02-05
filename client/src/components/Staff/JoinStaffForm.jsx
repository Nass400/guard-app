import { useState } from 'react';
import { useStaff } from '../../context/StaffContext';

export default function JoinStaffForm({ onClose, onBack }) {
  const { joinStaff } = useStaff();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await joinStaff(code);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Joined Successfully!</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-700">You have joined the staff rotation.</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          &larr;
        </button>
        <h2 className="text-xl font-bold text-gray-800">Join Staff</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            maxLength={6}
            placeholder="Enter 6-character code"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl font-mono tracking-widest uppercase"
          />
        </div>

        <p className="text-sm text-gray-500">
          Ask your rotation coordinator for the staff code.
        </p>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Joining...' : 'Join Staff'}
        </button>
      </form>
    </div>
  );
}
