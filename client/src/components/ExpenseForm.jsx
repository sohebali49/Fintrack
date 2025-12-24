import { useState } from 'react';
import axios from 'axios';

function ExpenseForm({ onExpenseAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://localhost:5000/api/expenses', formData);
      onExpenseAdded(); // Refresh expense list
      setFormData({ title: '', amount: '', category: '', description: '' });
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>Add New Expense</h2>
      
      <input
        type="text"
        placeholder="Title (e.g., Groceries)"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      
      <input
        type="number"
        placeholder="Amount (₹)"
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
        required
      />
      
      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
        required
      >
        <option value="">Select Category</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Bills">Bills</option>
        <option value="Other">Other</option>
      </select>
      
      <textarea
        placeholder="Description (optional)"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      
      <button type="submit">Add Expense</button>
    </form>
  );
}

export default ExpenseForm;