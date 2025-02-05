import { createContext, useContext, useState } from "react";
import { AuthClient } from '@dfinity/auth-client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [identity, setIdentity] = useState(null);

    const getIdentity = async () => {
        const authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
            setIdentity(authClient.getIdentity());
        }
    }

    return (
        <>
        <AuthContext.Provider value ={{identity, getIdentity, setIdentity}}>
            {children}
        </AuthContext.Provider>
        </>
    )
}

export const useAuth =()=>{
    return useContext(AuthContext)
}