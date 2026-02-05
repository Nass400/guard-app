import { useState } from 'react';
import { useStaff } from '../../context/StaffContext';

export default function CreateStaffForm({ onClose, onBack }) {
  const { createStaff } = useStaff();
  const [formData, setFormData] = useState({
    name: '',
    hospital: '',
    service: '',
    startDate: '',
    endDate: ''
  });
  const [createdStaff, setCreatedStaff] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const staff = await createStaff(formData);
      setCreatedStaff(staff);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (createdStaff) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Staff Created!</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Share this code with your colleagues:</p>
          <div className="text-3xl font-mono font-bold text-center text-green-600 tracking-widest">
            {createdStaff.code}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Members can use this code to join your staff rotation.
        </p>
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
        <h2 className="text-xl font-bold text-gray-800">Create Staff</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rotation Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Emergency Medicine Rotation"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
          <input
            type="text"
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            required
            placeholder="e.g., General Hospital"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service/Department</label>
          <input
            type="text"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            placeholder="e.g., Emergency Department"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Staff'}
        </button>
      </form>
    </div>
  );
}
