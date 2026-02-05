import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Printer, Save, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { GeneralSettingsContext } from '@/context/GeneralSettingsContext';
import { AuthContext } from '@/context/AuthProvider';

export default function PrintSettings() {
  const { user } = useContext(AuthContext);
  const { settings, loading, updateSettings } = useContext(GeneralSettingsContext);

  const [localSettings, setLocalSettings] = useState({
    printShowHeader: settings.printShowHeader,
    printShowFooter: settings.printShowFooter
  });
  const [saving, setSaving] = useState(false);

  // Update local state when context settings change
  React.useEffect(() => {
    setLocalSettings({
      printShowHeader: settings.printShowHeader,
      printShowFooter: settings.printShowFooter
    });
  }, [settings]);

  const handleToggle = (field) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const hasChanges = () => {
    return localSettings.printShowHeader !== settings.printShowHeader ||
           localSettings.printShowFooter !== settings.printShowFooter;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings, user?.name || 'Admin');
      toast.success('Print settings updated successfully!');
    } catch (error) {
      console.error('Error saving print settings:', error);
      toast.error('Failed to save print settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      borderRadius: '16px',
      border: 'none',
      marginLeft: '10px',
        marginRight: '10px',
        marginTop: '10px',
        marginBottom: '10px'
    }}>
      <CardHeader style={{
        background: 'linear-gradient(to right, #8B5CF6, #7C3AED)',
        color: 'white',
        padding: '16px 24px',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px'
          }}>
            <Printer style={{ width: '24px', height: '24px', color: '#ffffff' }} />
          </div>
          <div>
            <CardTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', margin: '0' }}>
              Print Settings
            </CardTitle>
            <p style={{ fontSize: '0.875rem', color: '#E9D5FF', marginTop: '4px' }}>
              Configure print report header and footer display
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#6B7280' }}>Loading settings...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Show Header Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ flex: 1 }}>
                <Label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Print Header with Final Report
                </Label>
                <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Display lab logo and information in report header
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('printShowHeader')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.printShowHeader ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.printShowHeader ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Show Footer Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ flex: 1 }}>
                <Label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Print Footer with Final Report
                </Label>
                <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Display contact information and signatures in report footer
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('printShowFooter')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.printShowFooter ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.printShowFooter ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            {hasChanges() && (
              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #E5E7EB'
              }}>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: 'linear-gradient(to right, #8B5CF6, #7C3AED)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}

            {!hasChanges() && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#ECFDF5',
                borderRadius: '8px',
                border: '1px solid #A7F3D0'
              }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} />
                <span style={{ fontSize: '0.875rem', color: '#065F46', fontWeight: '500' }}>
                  All changes saved
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}