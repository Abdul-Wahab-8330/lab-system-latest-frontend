import React, { useState, useEffect, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { AuthContext } from '@/context/AuthProvider';
import { SystemFiltersContext } from '@/context/SystemFiltersContext';
import axios from 'axios';
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
    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/20">
      <Calendar className="h-4 w-4 text-white" />
      <span className="text-xs text-white font-medium whitespace-nowrap">Global Filter:</span>
      <Input
        type="number"
        min="1"
        placeholder="Days"
        value={filterDays}
        onChange={(e) => setFilterDays(e.target.value)}
        className="h-9 w-20 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
        disabled={filterLoading}
      />
      <span className="text-xs text-white/80">days</span>
      
      {!currentFilter?.isActive ? (
        <Button
          size="sm"
          onClick={handleApplyFilter}
          disabled={filterLoading || !filterDays}
          className="bg-green-500 hover:bg-green-600 text-white h-9 shadow-lg"
        >
          {filterLoading ? 'Applying...' : 'Apply'}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={handleResetFilter}
          disabled={filterLoading}
          className="bg-red-500 hover:bg-red-600 text-white h-9 shadow-lg"
        >
          {filterLoading ? 'Resetting...' : 'Reset'}
        </Button>
      )}
      
      {currentFilter?.isActive && (
        <Badge className="bg-green-400 text-green-900 font-semibold shadow-md">
          ✓ Last {currentFilter.daysLimit} days
        </Badge>
      )}
    </div>
  );
}