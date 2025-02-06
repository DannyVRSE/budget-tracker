import { useState } from "react"
import timestamp from 'unix-timestamp';
import { budget_tracker_backend } from 'declarations/budget-tracker-backend';

const AddExpense = ({ identity , fetchPeriods, period}) => {
    const [expense, setExpense] = useState({
        date: "",
        details: "",
        amount: ""
    });

    const [loading, setLoading] = useState(false);

    //submit
    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        const done = await budget_tracker_backend.newExpense(identity.getPrincipal(), Number(period.id), timestamp.fromDate(expense.date), expense.details, Number(expense.amount));
        if (done && identity) {
            fetchPeriods();
        } else {
            console.log("error adding expense");
        }
        setLoading(false);

    }

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (<>
        {loading && <div className="loader"></div>}

        <form onSubmit={handleSubmit}>
            <legend>Period: {formatDate(period.start)} - {formatDate(period.end)} </legend>

            <div className="form-group">
                <label htmlFor="date">Date of Expense</label>
                <input type="date" id="date" name="date" value={expense.date} onChange={(e) => {
                    setExpense({ ...expense, date: e.target.value })
                }} className="form-control"></input>
            </div>

            <div className="form-group">
                <label htmlFor="details">Details</label>
                <input type="text" id="details" name="details" value={expense.details} onChange={(e) => {
                    setExpense({ ...expense, details: e.target.value })
                }} className="form-control"></input>
            </div>

            <div className="form-group">
                <label htmlFor="amount">Amount Spent</label>
                <input type="number" id="amount" name="amount" value={expense.amount} onChange={(e) => {
                    setExpense({ ...expense, amount: e.target.value })
                }} className="form-control"></input>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>Add Expense</button>
        </form>

    </>)
}

export default AddExpense