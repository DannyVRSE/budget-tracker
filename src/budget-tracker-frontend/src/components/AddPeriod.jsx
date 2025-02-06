import { useState } from "react";
import { budget_tracker_backend } from "declarations/budget-tracker-backend";
import timestamp from 'unix-timestamp';


const AddPeriod = ({ identity, fetchPeriods }) => {
    const [period, setPeriod] = useState({
        start: "",
        end: "",
        budget: 0
    });

    const [loading, setLoading] = useState(false);

    //submit
    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        const done = await budget_tracker_backend.newPeriod(identity.getPrincipal(), timestamp.fromDate(period.start), timestamp.fromDate(period.end), Number(period.budget));
        if (done && identity) {
            fetchPeriods();
        } else {
            console.log("error submitting period");
        }
        setLoading(false);
    }

    return (<>
        {loading && <div className="loader"></div>}

        <form onSubmit={handleSubmit}>
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

            <button type="submit" className="btn btn-primary" disabled={loading}>New Period</button>
        </form>
    </>)
}
export default AddPeriod;