import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Printer, Save, CheckCircle, Menu } from "lucide-react";
import toast from "react-hot-toast";
import { GeneralSettingsContext } from '@/context/GeneralSettingsContext';
import { AuthContext } from '@/context/AuthProvider';
import { Input } from "@/components/ui/input";

export default function PrintSettings() {
  const { user } = useContext(AuthContext);
  const { settings, loading, updateSettings } = useContext(GeneralSettingsContext);

  const [localSettings, setLocalSettings] = useState({
    printShowHeader: settings.printShowHeader,
    printShowFooter: settings.printShowFooter,
    headerTopMargin: settings.headerTopMargin || 0,
    tableWidthMode: settings.tableWidthMode || 'smart'
  });
  const [sidebarSettings, setSidebarSettings] = useState({
    enableGroupedMenu: settings.enableGroupedMenu || false
  });
  const [saving, setSaving] = useState(false);
  const [savingSidebar, setSavingSidebar] = useState(false);

  // Update local state when context settings change
  React.useEffect(() => {
    setLocalSettings({
      printShowHeader: settings.printShowHeader,
      printShowFooter: settings.printShowFooter,
      headerTopMargin: settings.headerTopMargin || 0,
      tableWidthMode: settings.tableWidthMode || 'smart'
    });
    setSidebarSettings({
      enableGroupedMenu: settings.enableGroupedMenu || false
    });
  }, [settings]);

  const handleToggle = (field) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // ✅ NEW: Handle margin change
  const handleMarginChange = (value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setLocalSettings(prev => ({
        ...prev,
        headerTopMargin: numValue
      }));
    }
  };

  const hasChanges = () => {
    return localSettings.printShowHeader !== settings.printShowHeader ||
      localSettings.printShowFooter !== settings.printShowFooter ||
      localSettings.headerTopMargin !== settings.headerTopMargin ||
      localSettings.tableWidthMode !== settings.tableWidthMode;
  };

  const hasSidebarChanges = () => {
    return sidebarSettings.enableGroupedMenu !== settings.enableGroupedMenu;
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

  const handleSaveSidebar = async () => {
    setSavingSidebar(true);
    try {
      await updateSettings(sidebarSettings, user?.name || 'Admin');
      toast.success('Sidebar settings updated successfully!');
    } catch (error) {
      console.error('Error saving sidebar settings:', error);
      toast.error('Failed to save sidebar settings');
    } finally {
      setSavingSidebar(false);
    }
  };

  return (
    <>
      <Card style={{
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        border: 'none',
        marginLeft: '20px',
        marginRight: '20px',
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.printShowHeader ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.printShowHeader ? 'translate-x-6' : 'translate-x-1'
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.printShowFooter ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.printShowFooter ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* ✅ NEW: Header Top Margin */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #E5E7EB',
                backgroundColor: '#FFFFFF'
              }}>
                <Label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Header Top Margin (mm)
                </Label>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '12px' }}>
                  Adjust the top page margin for reports (0-100mm). Use this when hiding header but need spacing.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Value Display */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#8B5CF6'
                    }}>
                      {localSettings.headerTopMargin} mm
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {localSettings.headerTopMargin === 0 ? 'No margin' : `${localSettings.headerTopMargin}% of max`}
                    </span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={localSettings.headerTopMargin}
                    onChange={(e) => handleMarginChange(e.target.value)}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      outline: 'none',
                      background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${localSettings.headerTopMargin}%, #E5E7EB ${localSettings.headerTopMargin}%, #E5E7EB 100%)`,
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                    className="custom-slider"
                  />

                  {/* Tick marks */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.625rem',
                    color: '#9CA3AF',
                    marginTop: '-4px'
                  }}>
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>

                <style>{`
  .custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #8B5CF6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s;
  }

  .custom-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
  }

  .custom-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #8B5CF6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s;
  }

  .custom-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
  }
`}</style>
              </div>

              {/* ✅ NEW: Table Width Mode */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #E5E7EB',
                backgroundColor: '#FFFFFF'
              }}>
                <Label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Table Width Mode
                </Label>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '12px' }}>
                  Choose how test result tables are displayed on reports
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Smart Mode Button */}
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, tableWidthMode: 'smart' }))}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      border: localSettings.tableWidthMode === 'smart' ? '2px solid #8B5CF6' : '2px solid #E5E7EB',
                      backgroundColor: localSettings.tableWidthMode === 'smart' ? '#F3E8FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: localSettings.tableWidthMode === 'smart' ? '6px solid #8B5CF6' : '2px solid #D1D5DB',
                        transition: 'all 0.2s'
                      }} />
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: localSettings.tableWidthMode === 'smart' ? '#7C3AED' : '#374151'
                      }}>
                        Smart Width (83%)
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      marginLeft: '28px'
                    }}>
                      Optimized spacing for single results
                    </p>
                  </button>

                  {/* Full Mode Button */}
                  <button
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, tableWidthMode: 'full' }))}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      border: localSettings.tableWidthMode === 'full' ? '2px solid #8B5CF6' : '2px solid #E5E7EB',
                      backgroundColor: localSettings.tableWidthMode === 'full' ? '#F3E8FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: localSettings.tableWidthMode === 'full' ? '6px solid #8B5CF6' : '2px solid #D1D5DB',
                        transition: 'all 0.2s'
                      }} />
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: localSettings.tableWidthMode === 'full' ? '#7C3AED' : '#374151'
                      }}>
                        Full Width (100%)
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      marginLeft: '28px'
                    }}>
                      Maximum width, matches history mode
                    </p>
                  </button>
                </div>
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
      {/* ============================================ */}
      {/* SIDEBAR SETTINGS CARD */}
      {/* ============================================ */}
      <Card style={{
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        border: 'none',
        marginLeft: '20px',
        marginRight: '20px',
        marginTop: '20px',
        marginBottom: '30px'
      }}>
        <CardHeader style={{
          background: 'linear-gradient(to right, #10B981, #059669)',
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
              <Menu style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', margin: '0' }}>
                Sidebar Settings
              </CardTitle>
              <p style={{ fontSize: '0.875rem', color: '#D1FAE5', marginTop: '4px' }}>
                Configure sidebar menu display and organization
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
              {/* Grouped Menu Toggle */}
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
                    Enable Grouped Sidebar Menu
                  </Label>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Show "Most Used" section and categorized menu in sidebar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarSettings(prev => ({ ...prev, enableGroupedMenu: !prev.enableGroupedMenu }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sidebarSettings.enableGroupedMenu ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sidebarSettings.enableGroupedMenu ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Save Button */}
              {hasSidebarChanges() && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E7EB'
                }}>
                  <Button
                    onClick={handleSaveSidebar}
                    disabled={savingSidebar}
                    style={{
                      background: 'linear-gradient(to right, #10B981, #059669)',
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
                    {savingSidebar ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}

              {!hasSidebarChanges() && (
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

    </>
  );
}