import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Paper, Grid, Card, CardContent, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Divider, InputAdornment
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AccountBalance, Savings, ShowChart,
  Add, Edit, Delete, Search as SearchIcon
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  // ===== STATES =====
  const [transactions, setTransactions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    title: '', amount: '', category: '', type: 'expense', description: '',
    name: '', investType: 'Stock', currentValue: '', targetAmount: '', savedAmount: '', goalCategory: 'Emergency'
  });

  const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFC107', '#795548'];
  const categories = {
    expense: ['Rent/Mortgage', 'Utilities', 'Dining Out', 'Retail', 'Transport', 'Health', 'Entertainment', 'Other'],
    income: ['Salary', 'Freelance', 'Investment Returns', 'Bonus', 'Other']
  };

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  // ===== API CALLS =====
  const fetchData = useCallback(async () => {
    try {
      const [transRes, investRes, goalsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses'),
        axios.get('http://localhost:5000/api/investments'),
        axios.get('http://localhost:5000/api/savinggoals')
      ]);
      setTransactions(transRes.data || []);
      setInvestments(investRes.data || []);
      setSavingGoals(goalsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== FILTERING LOGIC =====
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.amount.toString().includes(searchTerm) ||
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = monthFilter === 'all' || date.getMonth() === parseInt(monthFilter);
      const matchesYear = yearFilter === 'all' || date.getFullYear() === parseInt(yearFilter);
      
      return matchesSearch && matchesMonth && matchesYear;
    });
  };

  const getAvailableYears = () => {
    const years = new Set();
    transactions.forEach(t => {
      years.add(new Date(t.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const filtered = getFilteredTransactions();
  const expenses = filtered.filter(t => t.type === 'expense');
  const income = filtered.filter(t => t.type === 'income');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalInvestValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const investmentGain = totalInvestValue - totalInvested;
  const totalSaved = savingGoals.reduce((sum, g) => sum + g.savedAmount, 0);
  const netWorth = netSavings + totalInvestValue + totalSaved;

  // ===== CHART DATA =====
  const getCategoryBreakdown = (type) => {
    const data = {};
    filtered.filter(t => t.type === type).forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyData = () => {
    const months = {};
    transactions.forEach(t => {
      const month = format(new Date(t.date), 'MMM yyyy');
      if (!months[month]) months[month] = { income: 0, expenses: 0, net: 0 };
      if (t.type === 'expense') months[month].expenses += t.amount;
      else months[month].income += t.amount;
      months[month].net = months[month].income - months[month].expenses;
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data })).slice(-12);
  };

  const expenseData = getCategoryBreakdown('expense');
  const incomeData = getCategoryBreakdown('income');
  const monthlyData = getMonthlyData();

  // ===== HANDLERS =====
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    if (item) {
      setFormData({
        ...formData,
        ...item,
        investType: item.type || 'Stock',
        goalCategory: item.category || 'Emergency'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      title: '', amount: '', category: '', type: 'expense', description: '',
      name: '', investType: 'Stock', currentValue: '', targetAmount: '', savedAmount: '', goalCategory: 'Emergency'
    });
  };

  const handleSubmit = async () => {
    try {
      let endpoint, data;
      
      if (dialogType === 'transaction') {
        endpoint = 'expenses';
        data = { 
          title: formData.title, 
          amount: Number(formData.amount), 
          category: formData.category, 
          type: formData.type, 
          description: formData.description,
          date: new Date()
        };
      } else if (dialogType === 'investment') {
        endpoint = 'investments';
        data = { 
          name: formData.name, 
          type: formData.investType, 
          amount: Number(formData.amount), 
          currentValue: Number(formData.currentValue),
          date: new Date()
        };
      } else if (dialogType === 'goal') {
        endpoint = 'savinggoals';
        data = { 
          title: formData.title, 
          targetAmount: Number(formData.targetAmount), 
          savedAmount: Number(formData.savedAmount || 0), 
          category: formData.goalCategory,
          date: new Date()
        };
      }

      if (editingItem) {
        await axios.put(`http://localhost:5000/api/${endpoint}/${editingItem._id}`, data);
        toast.success('Updated successfully!');
      } else {
        await axios.post(`http://localhost:5000/api/${endpoint}`, data);
        toast.success('Added successfully!');
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const endpoint = type === 'transaction' ? 'expenses' : type === 'investment' ? 'investments' : 'savinggoals';
      await axios.delete(`http://localhost:5000/api/${endpoint}/${id}`);
      await fetchData();
      toast.success('Deleted successfully!');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setMonthFilter('all');
    setYearFilter('all');
  };

  // ===== RENDER =====
  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 4 }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* HEADER */}
      <Paper elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', py: 3, px: 4, mb: 3 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="#1976d2">
                💰 Fintrack
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your Go-To Finance Tracker • {format(new Date(), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* KPI CARDS - NOW 5 CARDS INCLUDING INVESTMENTS */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Net Worth</Typography>
                    <Typography variant="h5" fontWeight={700} color="#1976d2">₹{netWorth.toLocaleString()}</Typography>
                  </Box>
                  <AccountBalance sx={{ fontSize: 36, color: '#1976d2', opacity: 0.2 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Income</Typography>
                    <Typography variant="h5" fontWeight={700} color="#4caf50">₹{totalIncome.toLocaleString()}</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 36, color: '#4caf50', opacity: 0.2 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Expenses</Typography>
                    <Typography variant="h5" fontWeight={700} color="#f44336">₹{totalExpenses.toLocaleString()}</Typography>
                  </Box>
                  <TrendingDown sx={{ fontSize: 36, color: '#f44336', opacity: 0.2 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Savings</Typography>
                    <Typography variant="h5" fontWeight={700} color={netSavings >= 0 ? '#4caf50' : '#f44336'}>
                      ₹{netSavings.toLocaleString()}
                    </Typography>
                  </Box>
                  <Savings sx={{ fontSize: 36, color: netSavings >= 0 ? '#4caf50' : '#f44336', opacity: 0.2 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* NEW INVESTMENT KPI CARD */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Investments</Typography>
                    <Typography variant="h5" fontWeight={700} color="#9C27B0">₹{totalInvestValue.toLocaleString()}</Typography>
                    <Typography variant="caption" color={investmentGain >= 0 ? 'success.main' : 'error.main'}>
                      {investmentGain >= 0 ? '+' : ''}₹{investmentGain.toLocaleString()}
                    </Typography>
                  </Box>
                  <ShowChart sx={{ fontSize: 36, color: '#9C27B0', opacity: 0.2 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CHARTS ROW WITH INVESTMENT ANALYTICS */}
        <Grid container spacing={3} mb={4}>
          {/* INCOME PIE CHART */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Income Breakdown</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={incomeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={entry => entry.name}>
                    {incomeData.map((entry, index) => <Cell key={`cell-in-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <Box textAlign="center" mt={1}>
                <Typography variant="h5" fontWeight={700}>₹{totalIncome.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              </Box>
            </Card>
          </Grid>

          {/* EXPENSES PIE CHART */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Expenses Breakdown</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={entry => entry.name}>
                    {expenseData.map((entry, index) => <Cell key={`cell-ex-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <Box textAlign="center" mt={1}>
                <Typography variant="h5" fontWeight={700}>₹{totalExpenses.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              </Box>
            </Card>
          </Grid>

          {/* SAVINGS TREND AREA CHART */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Savings Trend</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={value => `₹${value.toLocaleString()}`} />
                  <Area type="monotone" dataKey="net" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* INVESTMENT OVERVIEW CARD */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Overall Investment Value</Typography>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={200}>
                <Typography variant="h4" fontWeight={700} color="#1976d2">
                  ₹{totalInvestValue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Invested: ₹{totalInvested.toLocaleString()}
                </Typography>
                <Typography variant="body2" fontWeight={600} color={investmentGain >= 0 ? 'success.main' : 'error.main'}>
                  Gain/Loss: {investmentGain >= 0 ? '+' : ''}₹{investmentGain.toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* INVESTMENT TYPE BREAKDOWN PIE CHART */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Investment Type Breakdown</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={
                      Object.values(
                        investments.reduce((acc, curr) => {
                          acc[curr.type] = acc[curr.type] || { type: curr.type, amount: 0 };
                          acc[curr.type].amount += curr.currentValue;
                          return acc;
                        }, {})
                      )
                    }
                    dataKey="amount"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={entry => entry.type}
                  >
                    {investments.map((entry, index) => (
                      <Cell key={`cell-invest-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* INVESTMENT GROWTH AREA CHART */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Investment Growth Trend</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={
                    investments
                      .map(inv => ({
                        date: format(new Date(inv.date), 'MMM yyyy'),
                        value: inv.currentValue
                      }))
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={value => `₹${value.toLocaleString()}`} />
                  <Area type="monotone" dataKey="value" stroke="#388e3c" fill="#388e3c" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* TABS */}
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Tab label="Transactions" />
            <Tab label="Investments" />
            <Tab label="Savings Goals" />
          </Tabs>

          <Box p={3}>
            {/* TRANSACTIONS TAB */}
            {activeTab === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                  <Typography variant="h6" fontWeight={600}>Transactions</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('transaction')}>
                    Add Transaction
                  </Button>
                </Box>

                {/* SEARCH AND FILTERS */}
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Search by title, category, or amount"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Month</InputLabel>
                      <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} label="Month">
                        {months.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Year</InputLabel>
                      <Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} label="Year">
                        <MenuItem value="all">All Years</MenuItem>
                        {getAvailableYears().map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={2}>
                    <Button variant="outlined" fullWidth onClick={handleClearFilters} size="small">
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" color="text.secondary" py={3}>
                              No transactions found. Add your first transaction to get started!
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.slice().reverse().map((t) => (
                          <TableRow key={t._id} hover>
                            <TableCell>{t.title}</TableCell>
                            <TableCell>
                              <Typography fontWeight={600} color={t.type === 'income' ? 'success.main' : 'error.main'}>
                                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={t.category} size="small" color={t.type === 'income' ? 'success' : 'error'} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {format(new Date(t.date), 'dd MMM yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(t.date), 'hh:mm a')}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleOpenDialog('transaction', t)} color="primary">
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDelete('transaction', t._id)} color="error">
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* INVESTMENTS TAB */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Investments</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('investment')}>
                    Add Investment
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Invested</strong></TableCell>
                        <TableCell><strong>Current Value</strong></TableCell>
                        <TableCell><strong>Gain/Loss</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {investments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary" py={3}>
                              No investments yet. Start tracking your investments!
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        investments.map((inv) => {
                          const gain = inv.currentValue - inv.amount;
                          return (
                            <TableRow key={inv._id} hover>
                              <TableCell>{inv.name}</TableCell>
                              <TableCell><Chip label={inv.type} size="small" /></TableCell>
                              <TableCell>₹{inv.amount.toLocaleString()}</TableCell>
                              <TableCell>₹{inv.currentValue.toLocaleString()}</TableCell>
                              <TableCell>
                                <Typography fontWeight={600} color={gain >= 0 ? 'success.main' : 'error.main'}>
                                  {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {inv.date ? format(new Date(inv.date), 'dd MMM yyyy') : 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => handleOpenDialog('investment', inv)} color="primary">
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete('investment', inv._id)} color="error">
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* SAVINGS GOALS TAB */}
            {activeTab === 2 && (
              <Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Savings Goals</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog('goal')}>
                    Add Goal
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {savingGoals.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f7fa' }}>
                        <Typography variant="body2" color="text.secondary">
                          No savings goals yet. Create your first goal to start saving!
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    savingGoals.map((goal) => {
                      const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={goal._id}>
                          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="h6" fontWeight={600}>{goal.title}</Typography>
                                <Chip label={goal.category} size="small" color="primary" />
                              </Box>
                              <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 1, mb: 1 }}>
                                <Box sx={{ width: `${progress}%`, bgcolor: '#4caf50', height: 8, borderRadius: 1 }} />
                              </Box>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">₹{goal.savedAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</Typography>
                                <Typography variant="body2" fontWeight={600}>{progress.toFixed(0)}%</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                Created: {goal.date ? format(new Date(goal.date), 'dd MMM yyyy') : 'N/A'}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => handleOpenDialog('goal', goal)}>
                                  Edit
                                </Button>
                                <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete('goal', goal._id)}>
                                  Delete
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })
                  )}
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit' : 'Add'}{' '}
          {dialogType === 'transaction' ? 'Transaction' : dialogType === 'investment' ? 'Investment' : 'Savings Goal'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {dialogType === 'transaction' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })} label="Type">
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required />
                <TextField label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} fullWidth required />
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} label="Category">
                    {categories[formData.type].map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} />
              </>
            )}

            {dialogType === 'investment' && (
              <>
                <TextField label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={formData.investType} onChange={(e) => setFormData({ ...formData, investType: e.target.value })} label="Type">
                    {['Stock', 'SIP', 'Crypto', 'Gold', 'Bond', 'RealEstate', 'Other'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Amount Invested" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} fullWidth required />
                <TextField label="Current Value" type="number" value={formData.currentValue} onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })} fullWidth required />
              </>
            )}

            {dialogType === 'goal' && (
              <>
                <TextField label="Goal Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required />
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={formData.goalCategory} onChange={(e) => setFormData({ ...formData, goalCategory: e.target.value })} label="Category">
                    {['Emergency', 'Vacation', 'Car', 'House', 'Education', 'Other'].map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Target Amount" type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} fullWidth required />
                <TextField label="Saved Amount" type="number" value={formData.savedAmount} onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })} fullWidth />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;