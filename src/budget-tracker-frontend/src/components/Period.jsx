import { useState } from "react";
import Expenditure from "./Expenditure";
import AddExpense from "./AddExpense";

const Period = ({ identity, periodObject, fetchPeriods }) => {
    const [expand, setExpand] = useState(false);
    const [addExpense, setAddExpense] = useState(false);

    let period = periodObject.period;
    let expenses = flattenExpenses(period.expenses);

        function flattenExpenses(hashMap) {
            let result = [];
        
            function traverse(node) {
                if (Array.isArray(node)) {
                    node.forEach(traverse);
                } else if (typeof node === 'object' && node !== null) {
                    if ('key' in node && 'hash' in node) {
                        // Extract next object as expense details
                        const nextIndex = result.length;
                        result[nextIndex] = { key: node.key, expense: {} };
                    } else if ('date' in node && 'details' in node && 'amount' in node) {
                        const lastEntry = result[result.length - 1];
                        if (lastEntry) {
                            lastEntry.expense = node;
                        }
                    } else {
                        Object.entries(node).forEach(([_, v]) => traverse(v));
                    }
                }
            }
        
            traverse(hashMap);
            return result;
        }

    //totals
    const totalExpenditure = (expenses) => {
        let total = 0;
        expenses.forEach((expenseObject) => {
            const expense = expenseObject.expense;
            total += expense.amount
        });
        return total
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
        <>
            {expand && <>
                <div className="alert-card-overlay">
                    <div className="alert-card-content">
                        <div className="card">
                            <div className="card-header">Expenses <a className="btn btn-outline-secondary ms-5" onClick={() => setExpand(false)}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="red" class="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                            </svg></a></div>
                            <div className="card-body">
                                <Expenditure expenses={expenses} fetchPeriods={fetchPeriods} />
                            </div>
                        </div>
                    </div>
                </div>
            </>}

            {addExpense && <>
                <div className="alert-card-overlay">
                    <div className="alert-card-content">
                        <div className="card">
                            <div className="card-header">New Expense <a className="btn btn-outline-secondary ms-5" onClick={() => setAddExpense(false)}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="red" className="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                            </svg></a></div>
                            <div className="card-body">
                                <AddExpense periodObject={periodObject} fetchPeriods={fetchPeriods} identity={identity}/>
                            </div>
                        </div>
                    </div>
                </div>
            </>}

            <div className="col-6 col-lg-3 mb-3 d-flex align-items-stetch">
                <div className="card">
                    <div className="card-header">
                        <h2># {periodObject.id}</h2>
                    </div>
                    <div className="card-body">
                        <div className="card-title">Details</div>
                        <div className="card-text">Start: {formatDate(period.start)}</div>
                        <div className="card-text">End: {formatDate(period.end)}</div>
                        <div className="card-text">Budget: {period.budget}</div>
                        <div className="card-text">Total Expenditure: {totalExpenditure(expenses)}</div>
                        <div className="card-text">Remaining Budget: {period.budget - totalExpenditure(expenses)}</div>
                        <div className="mt-3">
                            <a className="btn btn-primary" onClick={() => setExpand(true)}>Expand</a>
                            <a className="ms-5 btn btn-primary" onClick={() => setAddExpense(true)}>New Expense</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Period;