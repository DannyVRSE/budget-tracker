const Expenditure = ({ expenses }) => {

    /*function flattenExpenses(expenses) {
        // This function will recursively flatten the linked list structure
        let flatExpenses = [];

        function flatten(item) {
            if (Array.isArray(item)) {
                item.forEach(subItem => flatten(subItem));  // Recursively flatten each sub-item
            } else {
                flatExpenses.push(item);  // Add the expense object to the array
            }
        }

        flatten(expenses);
        return flatExpenses;
    }*/

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    }

    return (
        <>
            <table className="table">
                <thead>
                    <tr className="bg-gray-200">
                        <th>Date</th>
                        <th>Details</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map(expenseObject => (
                        <tr key={expenseObject.key}>
                            <td>{formatDate(expenseObject.expense.date)}</td>
                            <td>{expenseObject.expense.details}</td>
                            <td>{expenseObject.expense.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
export default Expenditure;