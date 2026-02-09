import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { DollarSign, CreditCard, Banknote, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Payment Method Dialog Component
 * 
 * Allows staff to add new payments with cash/bank/split options
 * 
 * Props:
 * - open: boolean - dialog visibility
 * - onOpenChange: function - toggle dialog
 * - patient: object - patient data
 * - onConfirm: function - callback with payment data
 */
export default function PaymentMethodDialog({ open, onOpenChange, patient, onConfirm }) {
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'bank' | 'split'
    const [amountToPay, setAmountToPay] = useState(patient?.dueAmount || 0);
    const [cashAmount, setCashAmount] = useState(0);
    const [bankAmount, setBankAmount] = useState(0);

    // Reset state when dialog opens
    React.useEffect(() => {
        if (open) {
            setPaymentMethod('cash');
            setAmountToPay(patient?.dueAmount || 0);
            setCashAmount(0);
            setBankAmount(0);
        }
    }, [open, patient]);

    // Validate and submit
    const handleConfirm = () => {
        // Validation 1: Amount must be positive
        if (amountToPay <= 0) {
            toast.error('Payment amount must be greater than 0');
            return;
        }

        // Validation 2: Amount cannot exceed due amount
        if (amountToPay > patient.dueAmount) {
            toast.error(`Payment cannot exceed due amount (Rs.${patient.dueAmount})`);
            return;
        }

        let finalCashAmount = 0;
        let finalBankAmount = 0;

        // Calculate based on payment method
        if (paymentMethod === 'cash') {
            finalCashAmount = amountToPay;
            finalBankAmount = 0;
        } else if (paymentMethod === 'bank') {
            finalCashAmount = 0;
            finalBankAmount = amountToPay;
        } else if (paymentMethod === 'split') {
            // Validation 3: Split amounts must equal total
            const splitTotal = Number(cashAmount) + Number(bankAmount);
            if (Math.abs(splitTotal - amountToPay) > 0.01) {
                toast.error(`Cash (${cashAmount}) + Bank (${bankAmount}) must equal ${amountToPay}`);
                return;
            }
            finalCashAmount = Number(cashAmount);
            finalBankAmount = Number(bankAmount);
        }

        // Calculate new totals (ADD to existing amounts)
        const newPaidAmount = patient.paidAmount + amountToPay;
        const newDueAmount = patient.dueAmount - amountToPay;
        const newCashAmount = patient.cashAmount + finalCashAmount;
        const newBankAmount = patient.bankAmount + finalBankAmount;

        // Determine new payment status
        let newPaymentStatus = 'Not Paid';
        if (newDueAmount <= 0) {
            newPaymentStatus = 'Paid';
        } else if (newPaidAmount > 0) {
            newPaymentStatus = 'Partially Paid';
        }

        // Send data to parent
        onConfirm({
            paidAmount: newPaidAmount,
            dueAmount: Math.max(0, newDueAmount),
            cashAmount: newCashAmount,
            bankAmount: newBankAmount,
            paymentStatus: newPaymentStatus
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white rounded-2xl border max-h-[97vh] overflow-y-auto border-gray-700 shadow-2xl max-w-lg">
                <DialogHeader className="pb-1">
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                        Add Payment
                    </DialogTitle>
                </DialogHeader>

                <Separator className="bg-gray-200" />

                <div className="py-4 space-y-1">
                    {/* Patient Info */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Patient:</span>
                            <span className="text-base font-semibold text-gray-900">{patient?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Net Total:</span>
                            <span className="text-base font-semibold text-gray-900">Rs.{patient?.netTotal || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Already Paid:</span>
                            <span className="text-base font-semibold text-green-600">Rs.{patient?.paidAmount || 0}</span>
                        </div>
                        <Separator className="bg-gray-300" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-red-700">Due Amount:</span>
                            <span className="text-xl font-bold text-red-600">Rs.{patient?.dueAmount || 0}</span>
                        </div>
                    </div>

                    {/* Amount to Pay */}
                    <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 mt-3 block">
                            Amount to Pay
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            max={patient?.dueAmount || 0}
                            value={amountToPay}
                            onChange={(e) => setAmountToPay(Number(e.target.value))}
                            className="h-12 text-lg font-semibold border-2 border-gray-400 focus:border-green-500 rounded-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum: Rs.{patient?.dueAmount || 0}</p>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Payment Method
                        </Label>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                            {/* Cash Option */}
                            <label
                                htmlFor="cash"
                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === 'cash'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-400'
                                    }`}
                                style={{
                                    borderColor: paymentMethod === 'cash' ? '#10B981' : '#E5E7EB',
                                    backgroundColor: paymentMethod === 'cash' ? '#ECFDF5' : '#FFFFFF',
                                    cursor: 'pointer'
                                }}
                            >
                                <RadioGroupItem value="cash" id="cash" />
                                <div className="flex-1 flex items-center">
                                    <Banknote className="h-5 w-5 text-green-600 mr-2" />
                                    <span
                                        className={`font-medium ${paymentMethod === 'cash' ? 'text-green-700' : 'text-gray-700'}`}
                                        style={{
                                            fontWeight: paymentMethod === 'cash' ? '600' : '500',
                                            color: paymentMethod === 'cash' ? '#047857' : '#374151'
                                        }}
                                    >
                                        Cash Payment
                                    </span>
                                    {paymentMethod === 'cash' && (
                                        <CheckCircle
                                            className="h-5 w-5 text-green-600 ml-auto"
                                            style={{ color: '#10B981' }}
                                        />
                                    )}
                                </div>
                            </label>

                            {/* Bank Option */}
                            <label
                                htmlFor="bank"
                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === 'bank'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-400'
                                    }`}
                                style={{
                                    borderColor: paymentMethod === 'bank' ? '#3B82F6' : '#E5E7EB',
                                    backgroundColor: paymentMethod === 'bank' ? '#EFF6FF' : '#FFFFFF',
                                    cursor: 'pointer'
                                }}
                            >
                                <RadioGroupItem value="bank" id="bank" />
                                <div className="flex-1 flex items-center">
                                    <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                                    <span
                                        className={`font-medium ${paymentMethod === 'bank' ? 'text-blue-700' : 'text-gray-700'}`}
                                        style={{
                                            fontWeight: paymentMethod === 'bank' ? '600' : '500',
                                            color: paymentMethod === 'bank' ? '#1D4ED8' : '#374151'
                                        }}
                                    >
                                        Bank/Online Payment
                                    </span>
                                    {paymentMethod === 'bank' && (
                                        <CheckCircle
                                            className="h-5 w-5 text-blue-600 ml-auto"
                                            style={{ color: '#3B82F6' }}
                                        />
                                    )}
                                </div>
                            </label>

                            {/* Split Option */}
                            <label
                                htmlFor="split"
                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === 'split'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-400'
                                    }`}
                                style={{
                                    borderColor: paymentMethod === 'split' ? '#A855F7' : '#E5E7EB',
                                    backgroundColor: paymentMethod === 'split' ? '#FAF5FF' : '#FFFFFF',
                                    cursor: 'pointer'
                                }}
                            >
                                <RadioGroupItem value="split" id="split" />
                                <div className="flex-1 flex items-center">
                                    <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                                    <span
                                        className={`font-medium ${paymentMethod === 'split' ? 'text-purple-700' : 'text-gray-700'}`}
                                        style={{
                                            fontWeight: paymentMethod === 'split' ? '600' : '500',
                                            color: paymentMethod === 'split' ? '#7E22CE' : '#374151'
                                        }}
                                    >
                                        Split Payment (Cash + Bank)
                                    </span>
                                    {paymentMethod === 'split' && (
                                        <CheckCircle
                                            className="h-5 w-5 text-purple-600 ml-auto"
                                            style={{ color: '#A855F7' }}
                                        />
                                    )}
                                </div>
                            </label>
                        </RadioGroup>
                    </div>

                    {/* Split Payment Inputs */}
                    {paymentMethod === 'split' && (
                        <div className="bg-purple-50 p-4 rounded-xl space-y-3 border-2 mt-2 border-purple-200">
                            <p className="text-sm font-semibold text-purple-900 mb-2">
                                Split Rs.{amountToPay} between Cash and Bank:
                            </p>

                            <div>
                                <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                                    Cash Amount
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={amountToPay}
                                    value={cashAmount === 0 ? '' : cashAmount}
                                    onChange={(e) => {
                                        const cash = Number(e.target.value);
                                        setCashAmount(cash);
                                        // Auto-calculate remaining for bank
                                        setBankAmount(Math.max(0, amountToPay - cash));
                                    }}
                                    className="h-10 border-2 border-gray-300 focus:border-purple-500 rounded-lg"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                                    Bank Amount
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={amountToPay}
                                    value={bankAmount === 0 ? '' : bankAmount}
                                    onChange={(e) => {
                                        const bank = Number(e.target.value);
                                        setBankAmount(bank);
                                        // Auto-calculate remaining for cash
                                        setCashAmount(Math.max(0, amountToPay - bank));
                                    }}
                                    className="h-10 border-2 border-gray-300 focus:border-purple-500 rounded-lg"
                                />
                            </div>

                            {/* Split Validation Display */}
                            <div className="flex justify-between items-center pt-2 border-t border-purple-300">
                                <span className="text-xs font-medium text-gray-700">Total:</span>
                                <span className={`text-sm font-bold ${(Number(cashAmount) + Number(bankAmount)) === amountToPay
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    Rs.{Number(cashAmount) + Number(bankAmount)}
                                    {(Number(cashAmount) + Number(bankAmount)) === amountToPay && ' ✓'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        >
                            Confirm Payment
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}