import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { budget_tracker_backend } from 'declarations/budget-tracker-backend';
import Period from "../components/Period";
import AddPeriod from "../components/AddPeriod";
import Navbar from "../components/Navbar";

const Home = () => {
    const { identity, getIdentity } = useAuth();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addPeriod, setAddPeriod] = useState(false);

    useEffect(() => {
        getIdentity();
    }, [identity])

    //create or fetch
    const fetchPeriods = async () => {
        setLoading(true);
        if (identity) {
            const fetched = await budget_tracker_backend.fetchPeriods(identity.getPrincipal());
            console.log(fetched)
            setPeriods(fetched);
        }
        setLoading(false);
    }
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: "10%" }}>
                <h1>Welcome</h1>
                <br />
                <button className="btn btn-primary" disabled={!identity || loading} onClick={fetchPeriods}>{identity ? "Start Tracking" : "Log in to start tracking"}</button>

                {loading && <div className="mt-3 loader"></div>}
                <div>

                    {identity &&
                        <>
                            <div className="mt-3">
                                <button className="btn btn-secondary" onClick={() => setAddPeriod(true)}>Add Period</button>
                                {addPeriod && <>
                                    <div className="alert-card-overlay" /* onClick={() => setAddPeriod(false)} */ >
                                        <div className="alert-card-content">
                                            <div className="card">
                                                <div className="card-header">
                                                    New Period
                                                    <a className="btn btn-outline-secondary ms-5" onClick={() => setAddPeriod(false)}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="red" className="bi bi-x-lg" viewBox="0 0 16 16">
                                                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                                    </svg></a>
                                                </div>
                                                <div className="card-body">
                                                    <AddPeriod identity={identity} fetchPeriods={fetchPeriods} />
                                                </div>

                                            </div>
                                        </div>
                                    </div>


                                </>}
                            </div>
                            <h2>Periods</h2>
                            <div className="mt-3 row">
                                {periods.map((period) => (
                                    <Period periodObject={period} key={period.id} fetchPeriods={fetchPeriods} identity={identity} />
                                ))}
                            </div>

                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default Home;