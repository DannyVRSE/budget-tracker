import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import Login from "../components/Login";
import { budget_tracker_backend } from 'declarations/budget-tracker-backend';
import timestamp from 'unix-timestamp';

const Home = () => {
    const { identity, getIdentity } = useAuth();
    const [periods, setPeriods] = useState([]);

    const [period, setPeriod] = useState({
        start: "",
        end: "",
        budget: 0
    });

    useEffect(() => {
        getIdentity();
    }, [identity])

    //create or fetch
    const fetchPeriods = async () => {
        if (identity) {
            const fetched = await budget_tracker_backend.fetchPeriods(identity.getPrincipal());
            console.log(fetched)
            setPeriods(fetched);
        }
    }

    const handleSubmitPeriod = async (e) => {
        e.preventDefault();
        const done = await budget_tracker_backend.newPeriod(identity.getPrincipal(), timestamp.fromDate(period.start), timestamp.fromDate(period.end), Number(period.budget));
        if (done) {
            fetchPeriods();
        } else {
            console.log("error")
        }
    }

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    function flattenExpenses(expenses) {
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
    }

    return (
        <div className="container">
            <h1>Budget Tracker</h1>
            <Login />
            <h1>identity: {identity ? identity.getPrincipal().toText() : ""}</h1>
            <button className="btn btn-primary" disabled={!identity} onClick={fetchPeriods}>Refresh</button>

            <div>
                <form onSubmit={handleSubmitPeriod}>
                    <div className="form-group">
                        <label htmlFor="start">Start</label>
                        <input type="date" id="start" name="start" value={period.start} onChange={(e) => {
                            setPeriod({ ...period, start: e.target.value })
                        }} className="form-control"></input>
                    </div>

                    <div className="form-group">
                        <label htmlFor="end">End</label>
                        <input type="date" id="end" name="end" value={period.end} onChange={(e) => {
                            setPeriod({ ...period, end: e.target.value })
                        }} className="form-control"></input>
                    </div>

                    <div className="form-group">
                        <label htmlFor="budget">Budget</label>
                        <input type="number" id="budget" name="budget" value={period.budget} onChange={(e) => {
                            setPeriod({ ...period, budget: e.target.value })
                        }} className="form-control"></input>
                    </div>

                    <button type="submit" className="btn btn-primary">New Period</button>
                </form>
            </div>

            <table className="table table-bordered mt-4 ">
                <thead>
                    <tr className="bg-gray-200">
                        <th scope="col">ID</th>
                        <th scope="col">Start</th>
                        <th scope="col">End</th>
                        <th scope="col">Budget</th>
                        <th scope="col">Expenses</th>
                    </tr>
                </thead>
                <tbody>
                    {periods.map((period) => (
                        <tr key={period.id}>
                            <td>{period.id}</td>
                            <td>{formatDate(period.start)}</td>
                            <td>{formatDate(period.end)}</td>
                            <td>{period.budget}</td>
                            <table>
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th>Date</th>
                                        <th>Details</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flattenExpenses(period.expenses).map(expense => (
                                        <tr key={expense.id}>
                                            <td>{formatDate(expense.date)}</td>
                                            <td>{expense.details}</td>
                                            <td>{expense.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </tr>
                    ))}
                </tbody>
            </table>



        </div>
    )
}

export default Home;