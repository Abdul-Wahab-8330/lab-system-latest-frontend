import React, { useState, useContext, useEffect } from 'react';
import { InventoryContext } from '../context/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  PackagePlus,
  PackageMinus,
  FileText,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Box,
  Calendar,
  Search,
  Archive
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { LabInfoContext } from '@/context/LabnfoContext';


export default function InventoryManagement() {
  const {
    items,
    transactions,
    stockLevels,
    loading,
    createItem,
    updateItem,
    deleteItem,
    addStock,
    removeStock,
    deleteTransaction,
    fetchTransactionsByDateRange,
    fetchStockLevels
  } = useContext(InventoryContext);

  // State for Item Master
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ itemId: '', itemName: '', description: '' });
  const reportRef = useRef();
  const { info } = useContext(LabInfoContext)


  // State for Transactions
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('addition');
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    itemId: '',
    quantity: '',
    remarks: ''
  });

  // State for Reports
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportDates, setReportDates] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // State for Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Search states
  const [itemSearch, setItemSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');

  // ============================================
  // ITEM MASTER FUNCTIONS
  // ============================================

  const openItemDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({ itemId: item.itemId, itemName: item.itemName, description: item.description || '' });
    } else {
      setEditingItem(null);
      setItemForm({ itemId: '', itemName: '', description: '' });
    }
    setItemDialogOpen(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateItem(editingItem._id, itemForm);
        toast.success('Item updated successfully!');
      } else {
        await createItem(itemForm);
        toast.success('Item created successfully!');
      }
      setItemDialogOpen(false);
      setItemForm({ itemId: '', itemName: '', description: '' });
      setEditingItem(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteItem = async () => {
    try {
      await deleteItem(itemToDelete._id);
      toast.success('Item deleted successfully!');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot delete item with existing transactions');
    }
  };

  // ============================================
  // TRANSACTION FUNCTIONS
  // ============================================

  const openTransactionDialog = (type) => {
    setTransactionType(type);
    setTransactionForm({
      date: new Date().toISOString().split('T')[0],
      itemId: '',
      quantity: '',
      remarks: ''
    });
    setTransactionDialogOpen(true);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...transactionForm,
        quantity: Number(transactionForm.quantity)
      };

      if (transactionType === 'addition') {
        await addStock(payload);
        toast.success('Stock added successfully!');
      } else {
        await removeStock(payload);
        toast.success('Stock Issued successfully!');
      }

      setTransactionDialogOpen(false);
      setTransactionForm({ date: new Date().toISOString().split('T')[0], itemId: '', quantity: '', remarks: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await deleteTransaction(transactionToDelete._id);
      toast.success('Transaction deleted successfully!');
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  // ============================================
  // REPORT FUNCTIONS
  // ============================================

  const generateReport = async () => {
    try {
      const data = await fetchTransactionsByDateRange(reportDates.startDate, reportDates.endDate);
      setReportData(data);
      setReportDialogOpen(true);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  //   const handlePrintReport = () => {
  //     window.print();
  //   };


  const handlePrintReport = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Inventory_Report_${reportDates.startDate}_to_${reportDates.endDate}`,
  });


  // Calculate report totals
  const reportTotals = reportData.reduce((acc, txn) => {
    if (txn.transactionType === 'addition') {
      acc.totalAdditions += txn.quantity;
    } else {
      acc.totalRemovals += txn.quantity;
    }
    return acc;
  }, { totalAdditions: 0, totalRemovals: 0 });

  // Get selected item details
  const getSelectedItemStock = () => {
    if (!transactionForm.itemId) return null;
    return stockLevels.find(s => s.itemId === transactionForm.itemId);
  };

  // Filter functions
  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.itemId.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredTransactions = transactions.filter(txn =>
    txn.itemName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    txn.transactionType.toLowerCase().includes(transactionSearch.toLowerCase())
  );

  const filteredStockLevels = stockLevels.filter(stock =>
    stock.itemName.toLowerCase().includes(stockSearch.toLowerCase()) ||
    stock.itemIdCode.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        </div> */}

        {/* Main Tabs */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 backdrop-blur-sm  rounded-xl shadow-sm gap-1">
            <TabsTrigger value="items" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600  data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg border-purple-200">
              <Box className="h-4 w-4 mr-2" />
              Item Master
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg border border-purple-200">
              <Archive className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg border-purple-200">
              <Package className="h-4 w-4 mr-2" />
              Current Stock
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg border-purple-200">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ITEM MASTER */}
          <TabsContent value="items">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 p-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl px-4 py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Box className="h-5 w-5 mr-2" />
                    Item Master List
                  </CardTitle>
                  <Button onClick={() => openItemDialog()} className="bg-indigo-600 text-purple-50 border border-purple-300 hover:text-white  hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-2 py-0">
                {/* Search */}
                <div className="mb-3">
                  <div className="relative">
                    <Input
                      placeholder="Search items by name or ID..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Items Table */}
                <div className="rounded-xl overflow-hidden border-2 border-gray-100">
                  {filteredItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableHead className="font-bold text-gray-800">Item ID</TableHead>
                          <TableHead className="font-bold text-gray-800">Item Name</TableHead>
                          <TableHead className="font-bold text-gray-800">Description</TableHead>
                          <TableHead className="font-bold text-gray-800 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item, index) => (
                          <TableRow key={item._id} className={`hover:bg-purple-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                            <TableCell className="font-semibold text-purple-700">{item.itemId}</TableCell>
                            <TableCell className="font-medium text-gray-900">{item.itemName}</TableCell>
                            <TableCell className="text-gray-600">{item.description || '—'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openItemDialog(item)}
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete(item);
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
                      <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No items found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: TRANSACTIONS */}
          <TabsContent value="transactions">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 p-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl py-2 px-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Archive className="h-5 w-5 mr-2" />
                    Transaction History
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => openTransactionDialog('addition')} className="bg-green-500 hover:bg-green-600">
                      <PackagePlus className="h-4 w-4 mr-2" />
                      Add Stock
                    </Button>
                    <Button onClick={() => openTransactionDialog('removal')} className="bg-orange-500 hover:bg-orange-600">
                      <PackageMinus className="h-4 w-4 mr-2" />
                      Issue Stock
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-1">
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Input
                      placeholder="Search transactions by item name or type..."
                      value={transactionSearch}
                      onChange={(e) => setTransactionSearch(e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="rounded-xl overflow-hidden border-2 border-gray-100">
                  {filteredTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableHead className="font-bold text-gray-800">Date</TableHead>
                          <TableHead className="font-bold text-gray-800">Item Name</TableHead>
                          <TableHead className="font-bold text-gray-800">Type</TableHead>
                          <TableHead className="font-bold text-gray-800">Quantity</TableHead>
                          <TableHead className="font-bold text-gray-800">Remarks</TableHead>
                          <TableHead className="font-bold text-gray-800 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((txn, index) => (
                          <TableRow key={txn._id} className={`hover:bg-purple-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                            <TableCell className="font-medium text-gray-900">
                              {new Date(txn.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-semibold text-purple-700">{txn.itemName}</TableCell>
                            <TableCell>
                              {txn.transactionType === 'addition' ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Addition
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  Removal
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-bold text-gray-900">{txn.quantity}</TableCell>
                            <TableCell className="text-gray-600">{txn.remarks || '—'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setTransactionToDelete(txn);
                                  setDeleteDialogOpen(true);
                                }}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No transactions found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: CURRENT STOCK */}
          <TabsContent value="stock">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 p-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl p-2">
                <CardTitle className="flex items-center text-xl">
                  <Package className="h-5 w-5 mr-2" />
                  Current Stock Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-0">
                {/* Search */}
                <div className="mb-3">
                  <div className="relative">
                    <Input
                      placeholder="Search stock by item name or ID..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Stock Table */}
                <div className="rounded-xl overflow-hidden border-2 border-gray-100">
                  {filteredStockLevels.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableHead className="font-bold text-gray-800">Item ID</TableHead>
                          <TableHead className="font-bold text-gray-800">Item Name</TableHead>
                          <TableHead className="font-bold text-gray-800">Description</TableHead>
                          <TableHead className="font-bold text-gray-800">Current Stock</TableHead>
                          <TableHead className="font-bold text-gray-800">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStockLevels.map((stock, index) => (
                          <TableRow key={stock.itemId} className={`hover:bg-purple-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                            <TableCell className="font-semibold text-purple-700">{stock.itemIdCode}</TableCell>
                            <TableCell className="font-medium text-gray-900">{stock.itemName}</TableCell>
                            <TableCell className="text-gray-600">{stock.description || '—'}</TableCell>
                            <TableCell className="font-bold text-xl text-gray-900">{stock.currentStock}</TableCell>
                            <TableCell>
                              {stock.currentStock === 0 ? (
                                <Badge className="bg-red-100 text-red-700 border-red-200">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Out of Stock
                                </Badge>
                              ) : stock.currentStock < 10 ? (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Low Stock
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  In Stock
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No stock data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: REPORTS */}
          <TabsContent value="reports">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 p-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl p-2">
                <CardTitle className="flex items-center text-xl">
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        value={reportDates.startDate}
                        onChange={(e) => setReportDates({ ...reportDates, startDate: e.target.value })}
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        End Date
                      </Label>
                      <Input
                        type="date"
                        value={reportDates.endDate}
                        onChange={(e) => setReportDates({ ...reportDates, endDate: e.target.value })}
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateReport}
                    className="w-full h-10 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl text-lg"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DIALOG: Add/Edit Item */}
        <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center">
                <Box className="h-5 w-5 mr-2 text-purple-600" />
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">Item ID *</Label>
                <Input
                  placeholder="e.g., ITM001"
                  value={itemForm.itemId}
                  onChange={(e) => setItemForm({ ...itemForm, itemId: e.target.value })}
                  required
                  disabled={!!editingItem}
                  className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">Item Name *</Label>
                <Input
                  placeholder="e.g., Blood Collection Tubes"
                  value={itemForm.itemName}
                  onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                  required
                  className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">Description</Label>
                <Input
                  placeholder="Optional description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  {editingItem ? 'Update' : 'Create'} Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: Add/Remove Transaction */}
        <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center">
                {transactionType === 'addition' ? (
                  <>
                    <PackagePlus className="h-5 w-5 mr-2 text-green-600" />
                    Add Stock
                  </>
                ) : (
                  <>
                    <PackageMinus className="h-5 w-5 mr-2 text-orange-600" />
                    Issue Stock
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">Date *</Label>
                <Input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  required
                  className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">Select Item *</Label>
                <Select
                  value={transactionForm.itemId}
                  onValueChange={(value) => setTransactionForm({ ...transactionForm, itemId: value })}
                  required
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl">
                    <SelectValue placeholder="Choose an item" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg">
                    {items.map((item) => (
                      <SelectItem key={item._id} value={item._id} className="hover:bg-purple-50">
                        {item.itemName} ({item.itemId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {transactionForm.itemId && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      Current Stock: <span className="font-bold">{getSelectedItemStock()?.currentStock || 0}</span> units
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={transactionForm.quantity}
                  onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                  required
                  className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2">Remarks</Label>
                <Input
                  placeholder="Optional notes"
                  value={transactionForm.remarks}
                  onChange={(e) => setTransactionForm({ ...transactionForm, remarks: e.target.value })}
                  className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={transactionType === 'addition' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700 text-white'}
                >
                  {transactionType === 'addition' ? 'Add Stock' : 'Issue Stock'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                {itemToDelete
                  ? `Are you sure you want to delete "${itemToDelete.itemName}"? This action cannot be undone.`
                  : `Are you sure you want to delete this transaction? This action cannot be undone.`}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setDeleteDialogOpen(false);
                  setItemToDelete(null);
                  setTransactionToDelete(null);
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={itemToDelete ? handleDeleteItem : handleDeleteTransaction}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* DIALOG: Report View */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-auto bg-white rounded-2xl">
            <DialogHeader className="print:hidden">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-purple-600" />
                  Inventory Report
                </DialogTitle>
                <Button onClick={handlePrintReport} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white mr-7">
                  <Printer className="h-4 w-4 mr-2" />
                  Print / Save as PDF
                </Button>
              </div>
            </DialogHeader>

            <div ref={reportRef} className="p-8">
              {/* Report Header */}
              <div className="text-center mb-6 pb-4 border-b-2">
                <div className="flex items-center justify-center mb-3">
                  <img src={info.logoUrl} alt="Lab Logo" className="h-12 w-12 mr-3" onError={(e) => e.target.style.display = 'none'} />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{info.labName || 'Medical Laboratory'}</h1>
                    <p className="text-sm text-gray-600">Inventory Management Report</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Period: {new Date(reportDates.startDate).toLocaleDateString()} - {new Date(reportDates.endDate).toLocaleDateString()} |
                  Generated: {new Date().toLocaleString()}
                </div>
              </div>

              {/* Summary Section - Simple Table Format */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-semibold">Total Transactions:</td>
                      <td className="py-2 text-right font-bold">{reportData.length}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-semibold text-green-700">Total Additions:</td>
                      <td className="py-2 text-right font-bold text-green-700">{reportTotals.totalAdditions}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-semibold text-orange-700">Total Removals:</td>
                      <td className="py-2 text-right font-bold text-orange-700">{reportTotals.totalRemovals}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Transactions Table */}
              <h2 className="text-lg font-bold mb-3 text-gray-900">Transaction Details</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-bold text-gray-900 border">Date</TableHead>
                    <TableHead className="font-bold text-gray-900 border">Item ID</TableHead>
                    <TableHead className="font-bold text-gray-900 border">Item Name</TableHead>
                    <TableHead className="font-bold text-gray-900 border">Type</TableHead>
                    <TableHead className="font-bold text-gray-900 border">Quantity</TableHead>
                    <TableHead className="font-bold text-gray-900 border">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((txn, index) => (
                      <TableRow key={txn._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <TableCell className="border">{new Date(txn.date).toLocaleDateString()}</TableCell>
                        <TableCell className="border font-semibold">{txn.itemId?.itemId || 'N/A'}</TableCell>
                        <TableCell className="border">{txn.itemName}</TableCell>
                        <TableCell className="border">
                          {txn.transactionType === 'addition' ? (
                            <span className="text-green-700 font-semibold">Addition ↑</span>
                          ) : (
                            <span className="text-orange-700 font-semibold">Removal ↓</span>
                          )}
                        </TableCell>
                        <TableCell className="border font-bold text-center">{txn.quantity}</TableCell>
                        <TableCell className="border text-gray-600">{txn.remarks || '—'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500 border">
                        No transactions found for the selected date range
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
                <p>Medical Laboratory - Inventory Management System</p>
                <p>This is a computer-generated report</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}