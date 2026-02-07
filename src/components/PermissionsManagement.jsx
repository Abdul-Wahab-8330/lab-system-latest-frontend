import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_PERMISSIONS, CATEGORIES, getRoleDisplayName } from '@/utils/permissions';
import { AuthContext } from '@/context/AuthProvider';
import axiosInstance from '@/api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import toast from 'react-hot-toast';

const PermissionsManagement = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser, isAuthenticated } = useContext(AuthContext);
  const [targetUser, setTargetUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ============================================
  // Fetch User Data
  // ============================================
  useEffect(() => {
    if(!isAuthenticated) return;
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/users/all`);
      const user = response.data.users.find(u => u._id === userId);
      
      if (user) {
        setTargetUser(user);
        setSelectedPermissions(user.permissions || []);
        setOriginalPermissions(user.permissions || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
    }
  };

  // ============================================
  // Toggle Permission
  // ============================================
  const togglePermission = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  // ============================================
  // Calculate Changes
  // ============================================
  const getChanges = () => {
    const added = selectedPermissions.filter(p => !originalPermissions.includes(p));
    const removed = originalPermissions.filter(p => !selectedPermissions.includes(p));
    return { added, removed };
  };

  // ============================================
  // Save Permissions
  // ============================================
  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(`${import.meta.env.VITE_API_URL}/api/users/permissions/${userId}`, {
        permissions: selectedPermissions,
        modifiedBy: {
          userId: loggedInUser.id,
          name: loggedInUser.name
        }
      });

      toast.success('Permissions updated successfully!');
      navigate('/admin/all-users');
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
    setSaving(false);
  };

  // ============================================
  // Get Available Permissions (filter admin-only)
  // ============================================
  const availablePermissions = ALL_PERMISSIONS.filter(p => {
    if (targetUser?.role === 'admin') return true;
    return !p.adminOnly;
  });

  // ============================================
  // Group Permissions by Category
  // ============================================
  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  const { added, removed } = getChanges();
  const hasChanges = added.length > 0 || removed.length > 0;

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!targetUser) {
    return <div className="p-8 text-center">User not found</div>;
  }

  return (
  <div className="p-6 max-w-7xl mx-auto min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f8fafc, #e0f2fe, #ddd6fe)' }}>
    
    {/* Header Card - Blue Gradient */}
    <div className="mb-6 rounded-2xl shadow-lg overflow-hidden border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
      <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>
              Edit User Permissions
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
              User: <span className="font-semibold">{targetUser.name}</span>
              {' · '}
              Role: <span className="font-semibold">{getRoleDisplayName(targetUser.role)}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/all-users')}
              className="transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {hasChanges && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="transition-all"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#4f46e5',
                  border: '2px solid #ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {showPreview ? 'Hide' : 'Preview'} Changes
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="transition-all disabled:opacity-50"
              style={{
                backgroundColor: hasChanges && !saving ? '#10b981' : '#008000',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Preview Changes Alert */}
    {showPreview && hasChanges && (
      <div className="mb-6 rounded-xl p-4 border" style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd' }}>
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#2563eb' }} />
          <div className="flex-1">
            <div className="space-y-3">
              {added.length > 0 && (
                <div>
                  <p className="font-semibold flex items-center gap-2 mb-2" style={{ color: '#15803d' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    Added ({added.length}):
                  </p>
                  <ul className="ml-6 text-sm space-y-1" style={{ color: '#166534' }}>
                    {added.map(id => {
                      const perm = ALL_PERMISSIONS.find(p => p.id === id);
                      return <li key={id}>• {perm?.label}</li>;
                    })}
                  </ul>
                </div>
              )}
              
              {removed.length > 0 && (
                <div>
                  <p className="font-semibold flex items-center gap-2 mb-2" style={{ color: '#b91c1c' }}>
                    <XCircle className="w-4 h-4" />
                    Removed ({removed.length}):
                  </p>
                  <ul className="ml-6 text-sm space-y-1" style={{ color: '#991b1b' }}>
                    {removed.map(id => {
                      const perm = ALL_PERMISSIONS.find(p => p.id === id);
                      return <li key={id}>• {perm?.label}</li>;
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Admin-Only Warning */}
    {targetUser.role !== 'admin' && (
      <div className="mb-6 rounded-xl p-3 border flex gap-3" style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
        <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#d97706' }} />
        <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
          Admin-only features are hidden for non-admin users.
        </p>
      </div>
    )}

    {/* Permissions Grid - COMPACT & PROFESSIONAL */}
    <div className="space-y-3">
      {Object.entries(groupedPermissions).map(([category, permissions]) => (
        <div key={category} className="rounded-xl shadow border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          
          {/* Small Category Header on Left Side */}
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ 
            backgroundColor: '#f9fafb', 
            borderColor: '#e5e7eb' 
          }}>
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#4f46e5' }}></div>
            <h3 className="text-sm font-semibold" style={{ color: '#374151' }}>
              {CATEGORIES[category] || category}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
              backgroundColor: '#e0e7ff', 
              color: '#4338ca' 
            }}>
              {permissions.length} items
            </span>
          </div>
          
          {/* Compact 4-Column Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {permissions.map(perm => {
                const isChecked = selectedPermissions.includes(perm.id);
                const isChanged = 
                  (isChecked && !originalPermissions.includes(perm.id)) ||
                  (!isChecked && originalPermissions.includes(perm.id));

                return (
                  <label
                    key={perm.id}
                    htmlFor={perm.id}
                    className="flex items-center space-x-2 p-2 rounded-lg border transition-all cursor-pointer hover:shadow-sm"
                    style={{
                      backgroundColor: isChanged ? '#fef9c3' : (isChecked ? '#eff6ff' : '#fafafa'),
                      borderColor: isChanged ? '#fbbf24' : (isChecked ? '#93c5fd' : '#e5e7eb'),
                      borderWidth: '1px'
                    }}
                  >
                    <Checkbox
                      id={perm.id}
                      checked={isChecked}
                      onCheckedChange={() => togglePermission(perm.id)}
                      className="flex-shrink-0"
                    />
                    <span
                      className="flex-1 text-xs font-medium select-none"
                      style={{ 
                        color: isChecked ? '#1e40af' : '#374151',
                        lineHeight: '1.3'
                      }}
                    >
                      {perm.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Last Modified Info */}
    {targetUser.lastModifiedBy && (
      <div className="mt-6 text-center p-3 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
        <p className="text-xs" style={{ color: '#6b7280' }}>
          Last modified by <span className="font-semibold" style={{ color: '#111827' }}>{targetUser.lastModifiedBy.name}</span> on{' '}
          {new Date(targetUser.lastModifiedBy.date).toLocaleString()}
        </p>
      </div>
    )}
  </div>
);
};

export default PermissionsManagement;