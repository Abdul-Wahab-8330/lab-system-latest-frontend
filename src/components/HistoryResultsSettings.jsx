import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { History, Save, RotateCcw, ArrowLeftRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { socket } from '@/socket';
import { AuthContext } from '@/context/AuthProvider';

export default function HistoryResultsSettings() {
    const { user } = useContext(AuthContext);

    const [settings, setSettings] = useState({
        historyResultsCount: 4,
        historyResultsDirection: 'left-to-right'
    });

    const [originalSettings, setOriginalSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(null);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();

        // Listen for real-time updates
        const handleUpdate = (data) => {
            if (data.filterType === 'results') {
                setSettings({
                    historyResultsCount: data.historyResultsCount || 4,
                    historyResultsDirection: data.historyResultsDirection || 'left-to-right'
                });
                setOriginalSettings({
                    historyResultsCount: data.historyResultsCount || 4,
                    historyResultsDirection: data.historyResultsDirection || 'left-to-right'
                });
                toast.success('Settings updated by another user');
            }
        };

        socket.on('historySettingsUpdated', handleUpdate);

        return () => {
            socket.off('historySettingsUpdated', handleUpdate);
        };
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/filters/results`);
            const data = {
                historyResultsCount: res.data.historyResultsCount || 4,
                historyResultsDirection: res.data.historyResultsDirection || 'left-to-right'
            };
            setSettings(data);
            setOriginalSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleCountChange = (value) => {
        setSettings(prev => ({
            ...prev,
            historyResultsCount: parseInt(value)
        }));
    };

    const handleDirectionChange = (value) => {
        setSettings(prev => ({
            ...prev,
            historyResultsDirection: value
        }));
    };

    const handleSaveClick = () => {
        setPendingChanges(settings);
        setConfirmDialogOpen(true);
    };

    const confirmSave = async () => {
        setLoading(true);
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/system/filters/results/history`,
                {
                    historyResultsCount: pendingChanges.historyResultsCount,
                    historyResultsDirection: pendingChanges.historyResultsDirection,
                    updatedBy: user?.name || 'Admin'
                }
            );

            setOriginalSettings(pendingChanges);
            toast.success('History settings updated successfully!');
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSettings({
            historyResultsCount: 4,
            historyResultsDirection: 'left-to-right'
        });
    };

    const hasChanges = () => {
        if (!originalSettings) return false;
        return settings.historyResultsCount !== originalSettings.historyResultsCount ||
            settings.historyResultsDirection !== originalSettings.historyResultsDirection;
    };

    return (
        <>
            <Card style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                border: 'none'
            }}>
                {/* Header */}
                <CardHeader style={{
                    background: 'linear-gradient(to right, #2563EB, #4F46E5)',
                    color: 'white',
                    padding: '16px 24px',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
                                <History style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                            </div>
                            <div>
                                <CardTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', margin: '0' }}>
                                    History Results Settings
                                </CardTitle>
                                <p style={{ fontSize: '0.875rem', color: '#BFDBFE', marginTop: '4px' }}>
                                    Configure historical test results display
                                </p>
                            </div>
                        </div>
                        {hasChanges() && (
                            <Badge style={{
                                backgroundColor: 'rgba(250, 204, 21, 0.3)',
                                color: '#FEF08A',
                                border: '1px solid rgba(250, 204, 21, 0.5)',
                                padding: '6px 12px',
                                borderRadius: '12px'
                            }}>
                                Unsaved Changes
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent style={{ padding: '32px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                                <RotateCcw style={{ width: '32px', height: '32px', color: '#3B82F6' }} />
                            </div>
                            <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading settings...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Number of Historical Results */}
                            <div>
                                <Label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>
                                    Number of Historical Results
                                    <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '400', marginLeft: '8px' }}>
                                        (excluding current result)
                                    </span>
                                </Label>

                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[0, 1, 2, 3, 4, 5].map(count => (
                                        <button
                                            key={count}
                                            onClick={() => handleCountChange(count)}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                border: settings.historyResultsCount === count
                                                    ? '2px solid #3B82F6'
                                                    : '2px solid #E5E7EB',
                                                backgroundColor: settings.historyResultsCount === count
                                                    ? '#EFF6FF'
                                                    : '#FFFFFF',
                                                color: settings.historyResultsCount === count
                                                    ? '#1E40AF'
                                                    : '#374151',
                                                fontWeight: settings.historyResultsCount === count ? '600' : '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                fontSize: '0.875rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (settings.historyResultsCount !== count) {
                                                    e.target.style.borderColor = '#3B82F6';
                                                    e.target.style.backgroundColor = '#F9FAFB';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (settings.historyResultsCount !== count) {
                                                    e.target.style.borderColor = '#E5E7EB';
                                                    e.target.style.backgroundColor = '#FFFFFF';
                                                }
                                            }}
                                        >
                                            {count === 0 ? 'None' : `${count} Result${count > 1 ? 's' : ''}`}
                                        </button>
                                    ))}
                                </div>

                                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '12px' }}>
                                    Total columns displayed: <strong>{settings.historyResultsCount + 1}</strong>
                                    {' '}(1 current + {settings.historyResultsCount} historical)
                                </p>
                            </div>

                            {/* Column Direction */}
                            <div>
                                <Label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>
                                    <ArrowLeftRight style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px' }} />
                                    Column Direction / Sequence
                                </Label>

                                <RadioGroup
                                    value={settings.historyResultsDirection}
                                    onValueChange={handleDirectionChange}
                                >
                                    <div style={{
                                        display: 'flex',
                                        gap: '16px',
                                        flexDirection: 'column'
                                    }}>
                                        {/* Left to Right */}
                                        <div
                                            onClick={() => handleDirectionChange('left-to-right')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: settings.historyResultsDirection === 'left-to-right'
                                                    ? '2px solid #3B82F6'
                                                    : '2px solid #E5E7EB',
                                                backgroundColor: settings.historyResultsDirection === 'left-to-right'
                                                    ? '#EFF6FF'
                                                    : '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <RadioGroupItem value="left-to-right" id="left-to-right" />
                                            <div style={{ flex: 1 }}>
                                                <Label
                                                    htmlFor="left-to-right"
                                                    style={{
                                                        fontWeight: '600',
                                                        color: '#374151',
                                                        cursor: 'pointer',
                                                        display: 'block',
                                                        marginBottom: '8px'
                                                    }}
                                                >
                                                    Left to Right (Default)
                                                </Label>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6B7280',
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#DBEAFE',
                                                        borderRadius: '6px',
                                                        fontWeight: '600',
                                                        color: '#1E40AF'
                                                    }}>Current</span>
                                                    <span>→</span>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#F3F4F6',
                                                        borderRadius: '6px'
                                                    }}>Recent</span>
                                                    <span>→</span>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#F3F4F6',
                                                        borderRadius: '6px'
                                                    }}>Older</span>
                                                    <span>→</span>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#F3F4F6',
                                                        borderRadius: '6px'
                                                    }}>Oldest</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right to Left */}
                                        <div
                                            onClick={() => handleDirectionChange('right-to-left')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: settings.historyResultsDirection === 'right-to-left'
                                                    ? '2px solid #3B82F6'
                                                    : '2px solid #E5E7EB',
                                                backgroundColor: settings.historyResultsDirection === 'right-to-left'
                                                    ? '#EFF6FF'
                                                    : '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <RadioGroupItem value="right-to-left" id="right-to-left" />
                                            <div style={{ flex: 1 }}>
                                                <Label
                                                    htmlFor="right-to-left"
                                                    style={{
                                                        fontWeight: '600',
                                                        color: '#374151',
                                                        cursor: 'pointer',
                                                        display: 'block',
                                                        marginBottom: '8px'
                                                    }}
                                                >
                                                    Right to Left
                                                </Label>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6B7280',
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#F3F4F6',
                                                        borderRadius: '6px'
                                                    }}>Oldest</span>
                                                    <span>→</span>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#F3F4F6',
                                                        borderRadius: '6px'
                                                    }}>Older</span>
                                                    <span>→</span>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#F3F4F6',
                                                        borderRadius: '6px'
                                                    }}>Recent</span>
                                                    <span>→</span>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#DBEAFE',
                                                        borderRadius: '6px',
                                                        fontWeight: '600',
                                                        color: '#1E40AF'
                                                    }}>Current</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                paddingTop: '16px',
                                borderTop: '1px solid #E5E7EB'
                            }}>
                                <Button
                                    onClick={handleReset}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#F3F4F6',
                                        color: '#374151',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <RotateCcw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                    Reset to Default
                                </Button>

                                <Button
                                    onClick={handleSaveClick}
                                    disabled={loading || !hasChanges()}
                                    style={{
                                        background: hasChanges()
                                            ? 'linear-gradient(to right, #3B82F6, #2563EB)'
                                            : '#9CA3AF',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        fontWeight: '600',
                                        cursor: hasChanges() ? 'pointer' : 'not-allowed',
                                        flex: 1
                                    }}
                                >
                                    <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent style={{
                    maxWidth: '450px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    <DialogHeader style={{ paddingBottom: '16px' }}>
                        <DialogTitle style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#111827',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#DBEAFE',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px'
                            }}>
                                <CheckCircle style={{ width: '16px', height: '16px', color: '#2563EB' }} />
                            </div>
                            Confirm Settings Update
                        </DialogTitle>
                    </DialogHeader>

                    <div style={{ padding: '16px 0' }}>
                        <DialogDescription style={{ color: '#6B7280', marginBottom: '16px' }}>
                            Are you sure you want to update the history results settings? This will affect all future print reports.
                        </DialogDescription>

                        <div style={{
                            backgroundColor: '#EFF6FF',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '2px solid #BFDBFE'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#1E40AF', marginBottom: '8px' }}>
                                <strong>New Settings:</strong>
                            </p>
                            <ul style={{ fontSize: '0.875rem', color: '#374151', paddingLeft: '20px' }}>
                                <li>Historical Results: <strong>{pendingChanges?.historyResultsCount}</strong></li>
                                <li>Direction: <strong>{pendingChanges?.historyResultsDirection === 'left-to-right' ? 'Left to Right' : 'Right to Left'}</strong></li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter style={{ marginTop: '16px' }}>
                        <Button
                            onClick={() => setConfirmDialogOpen(false)}
                            disabled={loading}
                            style={{
                                backgroundColor: '#F3F4F6',
                                color: '#374151',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmSave}
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <CheckCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                            {loading ? 'Saving...' : 'Yes, Update Settings'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
}