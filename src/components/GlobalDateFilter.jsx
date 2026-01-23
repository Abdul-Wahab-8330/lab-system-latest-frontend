import React, { useState, useEffect, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { AuthContext } from '@/context/AuthProvider';
import { SystemFiltersContext } from '@/context/SystemFiltersContext';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function GlobalDateFilter({ filterType }) {
  const { user } = useContext(AuthContext);
  const { filters, fetchFilters } = useContext(SystemFiltersContext);
  const [filterDays, setFilterDays] = useState('');
  const [filterLoading, setFilterLoading] = useState(false);

  const currentFilter = filters[filterType];

  // Initialize days input when filter loads
  useEffect(() => {
    if (currentFilter?.isActive && currentFilter?.daysLimit) {
      setFilterDays(currentFilter.daysLimit.toString());
    } else {
      setFilterDays('');
    }
  }, [currentFilter]);

  const handleApplyFilter = async () => {
    if (!filterDays || parseInt(filterDays) < 1) {
      toast.error('Please enter a valid number of days (minimum 1)');
      return;
    }

    setFilterLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/system/filters/${filterType}`,
        {
          daysLimit: parseInt(filterDays),
          updatedBy: user?.name || 'Admin'
        }
      );
      toast.success(`Global filter applied! Showing last ${filterDays} days for all users.`);
      await fetchFilters();
    } catch (error) {
      console.error('Error applying filter:', error);
      toast.error('Failed to apply filter. Please try again.');
    } finally {
      setFilterLoading(false);
    }
  };

  const handleResetFilter = async () => {
    setFilterLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/system/filters/${filterType}`
      );
      setFilterDays('');
      toast.success('Global filter removed! Showing all data.');
      await fetchFilters();
    } catch (error) {
      console.error('Error resetting filter:', error);
      toast.error('Failed to reset filter. Please try again.');
    } finally {
      setFilterLoading(false);
    }
  };

  // Only show for admin users
  if (user?.role?.toLowerCase() !== 'admin') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2 border"
      style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)'
      }}>
      <Calendar className="h-4 w-4 text-white" />
      <span className="text-xs font-medium whitespace-nowrap"
        style={{ color: '#FFFFFF' }}>Global Filter:</span>
      <Input
        type="number"
        min="1"
        placeholder="Days"
        value={filterDays}
        onChange={(e) => setFilterDays(e.target.value)}
        className="h-9 w-20 text-white"
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderColor: 'rgba(255,255,255,0.3)',
          color: '#FFFFFF'
        }}
        disabled={filterLoading}
      />
      <span className="text-xs whitespace-nowrap"
        style={{ color: 'rgba(255,255,255,0.8)' }}>days</span>

      {!currentFilter?.isActive ? (
        <button
          type="button"
          onClick={handleApplyFilter}
          disabled={filterLoading || !filterDays}
          className="h-9 px-4 text-sm font-semibold text-white rounded-lg shadow-lg transition-colors"
          style={{ backgroundColor: '#22C55E' }}        >
          {filterLoading ? 'Applying...' : 'Apply'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleResetFilter}
          disabled={filterLoading}
          className="h-9 px-4 text-sm font-semibold text-white rounded-lg shadow-lg transition-colors"
          style={{ backgroundColor: '#EF4444' }}        >
          {filterLoading ? 'Resetting...' : 'Reset'}
        </button>
      )}

      {currentFilter?.isActive && (
        <span className="px-3 py-1 text-xs font-semibold rounded-full shadow-md whitespace-nowrap"
          style={{
            backgroundColor: '#4ADE80',
            color: '#14532D'
          }}>
          ✓ Last {currentFilter.daysLimit} days
        </span>
      )}
    </div>
  );
}