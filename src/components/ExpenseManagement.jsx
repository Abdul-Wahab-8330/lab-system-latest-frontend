import React, { useState, useContext, useRef } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useReactToPrint } from 'react-to-print';
import {
    DollarSign,
    Plus,
    Trash2,
    Calendar,
    AlertTriangle,
    TrendingUp,
    Edit,
    FileText,
    Printer,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpenseManagement() {
    const {
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        fetchExpensesByDateRange
    } = useContext(ExpenseContext);

    const [expenseForm, setExpenseForm] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: ''
    });

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [detailedDialogOpen, setDetailedDialogOpen] = useState(false);
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [dateRangeFilter, setDateRangeFilter] = useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);

    const detailedReportRef = useRef();
    const summaryReportRef = useRef();

    const handlePrintDetailed = useReactToPrint({
        contentRef: detailedReportRef,
        documentTitle: `Detailed_Expense_Report_${dateRangeFilter.startDate}_to_${dateRangeFilter.endDate}`,
    });

    const handlePrintSummary = useReactToPrint({
        contentRef: summaryReportRef,
        documentTitle: `Summary_Expense_Report_${dateRangeFilter.startDate}_to_${dateRangeFilter.endDate}`,
    });

    const handleSubmit = async () => {
        if (!expenseForm.date || !expenseForm.description || !expenseForm.amount) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            if (editingExpense) {
                await updateExpense(editingExpense._id, expenseForm);
                toast.success('Expense updated successfully!');
            } else {
                await addExpense(expenseForm);
                toast.success('Expense added successfully!');
            }
            setExpenseForm({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: ''
            });
            setAddDialogOpen(false);
            setEditingExpense(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setExpenseForm({
            date: new Date(expense.date).toISOString().split('T')[0],
            description: expense.description,
            amount: expense.amount.toString()
        });
        setAddDialogOpen(true);
    };

    const handleDelete = async () => {
        try {
            await deleteExpense(expenseToDelete._id);
            toast.success('Expense deleted successfully!');
            setDeleteDialogOpen(false);
            setExpenseToDelete(null);
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    const handleDateRangeFilter = async () => {
        try {
            const data = await fetchExpensesByDateRange(dateRangeFilter.startDate, dateRangeFilter.endDate);
            setFilteredExpenses(data);
            setIsFiltered(true);
            toast.success('Expenses filtered successfully!');
        } catch (error) {
            toast.error('Failed to filter expenses');
        }
    };

    const clearFilter = () => {
        setIsFiltered(false);
        setFilteredExpenses([]);
    };

    const groupExpensesByDate = (expensesList) => {
        const grouped = {};
        expensesList.forEach(expense => {
            const dateKey = new Date(expense.date).toLocaleDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(expense);
        });
        return grouped;
    };

    const calculateDateTotal = (expensesList) => {
        return expensesList.reduce((sum, exp) => sum + exp.amount, 0);
    };

    const calculateGrandTotal = (expensesList) => {
        return expensesList.reduce((sum, exp) => sum + exp.amount, 0);
    };

    const displayExpenses = isFiltered ? filteredExpenses : expenses;
    const groupedExpenses = groupExpensesByDate(displayExpenses);
    const grandTotal = calculateGrandTotal(displayExpenses);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 p-4">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 p-0">
                    <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-2xl py-3 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-xl">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Daily Expense Management
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button style={{ backgroundColor: '#ffffff', color: '#f97316', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                    onClick={() => setAddDialogOpen(true)} className="bg-white text-orange-600 hover:bg-orange-50">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Expense
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateRangeFilter.startDate}
                                    onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, startDate: e.target.value })}
                                    className="h-10 min-w-36 border-2 border-gray-200 p-1"
                                />
                                <span className="text-gray-500 text-sm">to</span>
                                <Input
                                    type="date"
                                    value={dateRangeFilter.endDate}
                                    onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, endDate: e.target.value })}
                                    className="h-10 min-w-36 border-2 border-gray-200 p-1"
                                />
                                <Button style={{ backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                    onClick={handleDateRangeFilter} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Calendar className="h-4 w-4 mr-1 text-white" />
                                    Filter
                                </Button>
                                {isFiltered && (
                                    <Button style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                        onClick={clearFilter} size="sm" variant="outline">
                                        Clear
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button style={{ backgroundColor: '#fed7aa', color: '#c2410c', border: '1px solid #f97316', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                    onClick={() => setDetailedDialogOpen(true)} variant="outline" size="sm" className='bg-orange-200 border border-orange-300 hover:bg-orange-500 hover:text-white'>
                                    <FileText className="h-4 w-4 mr-1" />
                                    Detailed Report
                                </Button>
                                <Button style={{ backgroundColor: '#fed7aa', color: '#c2410c', border: '1px solid #f97316', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                    onClick={() => setSummaryDialogOpen(true)} variant="outline" size="sm" className='bg-orange-200 border border-orange-300 hover:bg-orange-500 hover:text-white'>
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Daily Report
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4 p-3  text-orange-500 border border-orange-500 rounded-xl">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">
                                    {isFiltered ? 'Filtered Total' : 'Grand Total'}
                                </span>
                                <span className="text-2xl font-bold">Rs. {grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden border-2 border-gray-100">
                            {displayExpenses.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <TableHead className="font-bold text-gray-800">Date</TableHead>
                                            <TableHead className="font-bold text-gray-800">Description</TableHead>
                                            <TableHead className="font-bold text-gray-800 text-right">Amount</TableHead>
                                            <TableHead className="font-bold text-gray-800 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayExpenses.slice().reverse().map((expense, index) => (
                                            <TableRow key={expense._id} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                                <TableCell className="font-medium text-gray-900">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">{expense.description}</TableCell>
                                                <TableCell className="text-right font-bold text-orange-600 text-lg">
                                                    Rs. {expense.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(expense)}
                                                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setExpenseToDelete(expense);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12">
                                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No expenses found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={addDialogOpen} onOpenChange={(open) => {
                    setAddDialogOpen(open);
                    if (!open) {
                        setEditingExpense(null);
                        setExpenseForm({
                            date: new Date().toISOString().split('T')[0],
                            description: '',
                            amount: ''
                        });
                    }
                }}>
                    <DialogContent className="max-w-md bg-white rounded-2xl border border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center">
                                {editingExpense ? <Edit className="h-5 w-5 mr-2 text-blue-600" /> : <Plus className="h-5 w-5 mr-2 text-orange-600" />}
                                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-2">Date *</Label>
                                <Input
                                    type="date"
                                    value={expenseForm.date}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                    className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-2">Description *</Label>
                                <Input
                                    placeholder="e.g., Lab supplies"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-2">Amount (Rs.) *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={expenseForm.amount}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                    className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                    variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                                <button style={{ backgroundColor: '#f97316', color: '#ffffff', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                    onClick={handleSubmit} className="bg-orange-500 text-white">
                                    {editingExpense ? 'Update' : 'Add'} Expense
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="max-w-md bg-white border border-gray-700 rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center text-red-600">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Delete Expense
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-gray-600 mb-4">Are you sure you want to delete this expense?</p>
                            {expenseToDelete && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <p className="font-semibold text-gray-900">{expenseToDelete.description}</p>
                                    <p className="text-red-600 font-bold">Rs. {expenseToDelete.amount.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">{new Date(expenseToDelete.date).toLocaleDateString()}</p>
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <Button style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem' }}
                                    variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                                <Button style={{ backgroundColor: '#dc2626', color: '#ffffff', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={detailedDialogOpen} onOpenChange={setDetailedDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-white border border-gray-700 rounded-2xl">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl font-bold flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-orange-600" />
                                    Detailed Expense Report
                                </DialogTitle>
                                <Button onClick={handlePrintDetailed} size="sm" className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print / Download PDF
                                </Button>
                            </div>
                        </DialogHeader>

                        <div ref={detailedReportRef} className="py-4 px-2">
                            <div className="text-center mb-6 pb-4 border-b-2">
                                <h2 className="text-2xl font-bold text-gray-900">Medical Laboratory</h2>
                                <p className="text-gray-600">Detailed Expense Report</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Period: {new Date(dateRangeFilter.startDate).toLocaleDateString()} - {new Date(dateRangeFilter.endDate).toLocaleDateString()}
                                </p>
                            </div>

                            {Object.entries(groupedExpenses).map(([date, dateExpenses]) => {
                                const dateTotal = calculateDateTotal(dateExpenses);
                                return (
                                    <div key={date} className="mb-6">
                                        <div className="bg-orange-100 px-4 py-2 rounded-t-lg flex justify-between items-center">
                                            <span className="font-bold text-gray-900">{date}</span>
                                            <span className="font-bold text-orange-700">Rs. {dateTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="border-2 border-gray-200 rounded-b-lg">
                                            {dateExpenses.map((exp, i) => (
                                                <div key={exp._id} className={`flex justify-between p-3 ${i !== dateExpenses.length - 1 ? 'border-b' : ''}`}>
                                                    <span className="text-gray-900">{exp.description}</span>
                                                    <span className="font-semibold text-orange-600">Rs. {exp.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="mt-6 pt-4 border-t-2 text-right">
                                <span className="text-xl font-bold text-gray-900">Grand Total: </span>
                                <span className="text-2xl font-bold text-orange-600">Rs. {grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] border border-gray-700 overflow-auto bg-white rounded-2xl">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl font-bold flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                                    Summary Expense Report
                                </DialogTitle>
                                <Button onClick={handlePrintSummary} size="sm" className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print / Download PDF
                                </Button>
                            </div>
                        </DialogHeader>

                        <div ref={summaryReportRef} className="py-4 px-2">
                            <div className="text-center mb-6 pb-4 border-b-2">
                                <h2 className="text-2xl font-bold text-gray-900">Medical Laboratory</h2>
                                <p className="text-gray-600">Summary Expense Report</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Period: {new Date(dateRangeFilter.startDate).toLocaleDateString()} - {new Date(dateRangeFilter.endDate).toLocaleDateString()}
                                </p>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-orange-100">
                                        <TableHead className="font-bold text-gray-900">Date</TableHead>
                                        <TableHead className="font-bold text-gray-900 text-right">Total Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(groupedExpenses).map(([date, dateExpenses]) => {
                                        const dateTotal = calculateDateTotal(dateExpenses);
                                        return (
                                            <TableRow key={date}>
                                                <TableCell className="font-medium text-gray-900">{date}</TableCell>
                                                <TableCell className="text-right font-bold text-orange-600">
                                                    Rs. {dateTotal.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            <div className="mt-6 pt-4 border-t-2 text-right">
                                <span className="text-xl font-bold text-gray-900">Grand Total: </span>
                                <span className="text-2xl font-bold text-orange-600">Rs. {grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}