import ExpenseItem from './ExpenseItem';

function ExpenseList({ expenses, onExpenseDeleted }) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="expense-list">
      <h2>Your Expenses</h2>
      <div className="total">
        <h3>Total: ₹{totalAmount}</h3>
      </div>
      {expenses.length === 0 ? (
        <p>No expenses yet. Add your first expense!</p>
      ) : (
        expenses.map((expense) => (
          <ExpenseItem
            key={expense._id}
            expense={expense}
            onExpenseDeleted={onExpenseDeleted}
          />
        ))
      )}
    </div>
  );
}

export default ExpenseList;