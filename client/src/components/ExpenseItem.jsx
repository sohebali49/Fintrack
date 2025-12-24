import axios from 'axios';

function ExpenseItem({ expense, onExpenseDeleted }) {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`http://localhost:5000/api/expenses/${expense._id}`);
        onExpenseDeleted();
        alert('Expense deleted!');
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <div className="expense-item">
      <div className="expense-info">
        <h3>{expense.title}</h3>
        <p className="category">{expense.category}</p>
        <p className="description">{expense.description}</p>
        <p className="date">{new Date(expense.date).toLocaleDateString()}</p>
      </div>
      <div className="expense-amount">
        <span>₹{expense.amount}</span>
        <button onClick={handleDelete} className="delete-btn">Delete</button>
      </div>
    </div>
  );
}

export default ExpenseItem;