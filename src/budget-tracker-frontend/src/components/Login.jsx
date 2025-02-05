import { AuthClient } from '@dfinity/auth-client';
import { useAuth } from '../hooks/AuthContext';

const Login = () => {
    const { setIdentity, identity } = useAuth();
    //login with Internet identity
    // One day in nanoseconds
    const days = BigInt(1);
    const hours = BigInt(24);
    const nanoseconds = BigInt(3600000000000);

    const login = async () => {
        //create an auth client
        const authClient = await AuthClient.create();
        //start the login process
        await new Promise((resolve) => {
            authClient.login(
                {
                    identityProvider: identityProvider(),
                    // Maximum authorization expiration is 8 days
                    maxTimeToLive: days * hours * nanoseconds,
                    onSuccess: resolve,
                }
            )
        })
        //set the identity
        setIdentity(authClient.getIdentity());
    };

    //logout
    const logout = async () => {
        const authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
            console.log(`Logging out ${identity.getPrincipal().toText()} ...`);
            await authClient.logout();
        }
        setIdentity(null);
    };



    const identityProvider = () => {
        if (process.env.DFX_NETWORK === "local") {
            return `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
        } else if (process.env.DFX_NETWORK === "ic") {
            return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.ic0.app`;
        } else {
            return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.dfinity.network`;
        }
    }
    return (<>
        <button className="btn btn-primary"onClick={login}>Login</button>
        <button className="ms-3 btn btn-primary"onClick={logout}>Logout</button>
    </>)
}

export default Login;