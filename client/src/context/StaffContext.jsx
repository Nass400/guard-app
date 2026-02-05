import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
  const { token, user } = useAuth();
  const [staffs, setStaffs] = useState([]);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [currentStaffDetails, setCurrentStaffDetails] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [quotaDashboard, setQuotaDashboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffs = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(api('/api/staff'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffs(data);
        if (data.length > 0 && !currentStaff) {
          setCurrentStaff(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch staffs:', error);
    } finally {
      setLoading(false);
    }
  }, [token, currentStaff]);

  const fetchStaffDetails = useCallback(async () => {
    if (!token || !currentStaff) return;

    try {
      const res = await fetch(api(`/api/staff/${currentStaff.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentStaffDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch staff details:', error);
    }
  }, [token, currentStaff]);

  const fetchShifts = useCallback(async () => {
    if (!token || !currentStaff) return;

    try {
      const res = await fetch(api(`/api/shifts/${currentStaff.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    }
  }, [token, currentStaff]);

  const fetchQuotas = useCallback(async () => {
    if (!token || !currentStaff) return;

    try {
      const res = await fetch(api(`/api/quotas/${currentStaff.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotas(data.quotas);
      }
    } catch (error) {
      console.error('Failed to fetch quotas:', error);
    }
  }, [token, currentStaff]);

  const fetchQuotaDashboard = useCallback(async () => {
    if (!token || !currentStaff) return;

    try {
      const res = await fetch(api(`/api/quotas/${currentStaff.id}/dashboard`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotaDashboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch quota dashboard:', error);
    }
  }, [token, currentStaff]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  useEffect(() => {
    if (currentStaff) {
      fetchStaffDetails();
      fetchShifts();
      fetchQuotas();
      fetchQuotaDashboard();
    } else {
      setCurrentStaffDetails(null);
      setShifts([]);
      setQuotas([]);
      setQuotaDashboard([]);
    }
  }, [currentStaff, fetchStaffDetails, fetchShifts, fetchQuotas, fetchQuotaDashboard]);

  const createStaff = async (staffData) => {
    const res = await fetch(api('/api/staff'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(staffData)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create staff');
    }

    const newStaff = await res.json();
    setStaffs(prev => [...prev, newStaff]);
    setCurrentStaff(newStaff);
    return newStaff;
  };

  const joinStaff = async (code) => {
    const res = await fetch(api('/api/staff/join'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to join staff');
    }

    const staff = await res.json();
    setStaffs(prev => [...prev, staff]);
    setCurrentStaff(staff);
    return staff;
  };

  const createShift = async (shiftData) => {
    const res = await fetch(api('/api/shifts'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(shiftData)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create shift');
    }

    const newShift = await res.json();
    setShifts(prev => [...prev, newShift]);
    return newShift;
  };

  const updateShift = async (shiftId, shiftData) => {
    const res = await fetch(api(`/api/shifts/${shiftId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(shiftData)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update shift');
    }

    const updatedShift = await res.json();
    setShifts(prev => prev.map(s => s.id === shiftId ? updatedShift : s));
    return updatedShift;
  };

  const deleteShift = async (shiftId) => {
    const res = await fetch(api(`/api/shifts/${shiftId}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete shift');
    }

    setShifts(prev => prev.filter(s => s.id !== shiftId));
  };

  const updateQuota = async (date, quota) => {
    const res = await fetch(api(`/api/quotas/${currentStaff.id}/${date}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quota })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update quota');
    }

    const updated = await res.json();
    setQuotas(prev => {
      const idx = prev.findIndex(q => q.date === date);
      if (idx >= 0) {
        return prev.map(q => q.date === date ? updated : q);
      }
      return [...prev, updated];
    });
    fetchQuotaDashboard();
    return updated;
  };

  const getQuotaForDate = useCallback((dateStr) => {
    const custom = quotas.find(q => q.date === dateStr);
    if (custom) return custom.quota;
    const day = new Date(dateStr + 'T00:00:00').getDay();
    if (day === 0) return 2;
    if (day === 6) return 1.5;
    return 1;
  }, [quotas]);

  const isCreator = currentStaff?.creatorId === user?.id;
  const isModerator = isCreator || (currentStaff?.moderatorIds || []).includes(user?.id);

  const toggleModerator = async (userId) => {
    const res = await fetch(api(`/api/staff/${currentStaff.id}/moderator`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to toggle moderator');
    }

    const updated = await res.json();
    setCurrentStaffDetails(updated);
    setCurrentStaff(prev => ({ ...prev, moderatorIds: updated.moderatorIds }));
    setStaffs(prev => prev.map(s => s.id === currentStaff.id ? { ...s, moderatorIds: updated.moderatorIds } : s));
    return updated;
  };

  return (
    <StaffContext.Provider value={{
      staffs,
      currentStaff,
      currentStaffDetails,
      setCurrentStaff,
      shifts,
      loading,
      createStaff,
      joinStaff,
      createShift,
      updateShift,
      deleteShift,
      quotas,
      quotaDashboard,
      fetchQuotas,
      fetchQuotaDashboard,
      updateQuota,
      getQuotaForDate,
      isCreator,
      isModerator,
      toggleModerator,
      refreshShifts: fetchShifts
    }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within StaffProvider');
  }
  return context;
}
