import Login from "./Login";
import { useAuth } from "../hooks/AuthContext";
const Navbar = () => {
    const { identity } = useAuth();
    return (<>
        <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
            <div className="container-fluid">
                <a className="navbar-brand me-auto" href="#">
                    Budget Tracker
                </a>
                {identity && <h4 className="me-3">Identity: {identity.getPrincipal().toText()}</h4>}
                <Login />
            </div>
        </nav></>
    )
}
export default Navbar;