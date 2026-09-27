import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import type {AccountInfoData} from "./types.ts";


interface AuthContextValue {
    token: string | null;
    account: AccountInfoData | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: {children: ReactNode}) {
    const [token, setToken] = useState<string|null>(null);
    const [account, setAccount] = useState<AccountInfoData | null>(null);

    async function login(email: string, password: string) {
        const { token, id } = await loginRequest(email, password);
        const accountInfo = await fetchAccountInfo(id, token);
        setToken(token);
        setAccount(accountInfo);
    }

    function logout(){
        setToken(null);
        setAccount(null)
    }
    return (
        <AuthContext.Provider value={{ token, account, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}

export async function loginRequest(email: string, password: string) {
    const result = await fetch("http://127.0.0.1:8001/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({email, password}),
    });

    if (!result.ok) {
        throw new Error(result.statusText);
    }
    return result.json()
}

async function fetchAccountInfo(id: number, token: string): Promise<AccountInfoData> {
    const result = await fetch(`http://127.0.0.1:8001/account/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!result.ok) throw new Error(result.statusText);
    return result.json();
}

export function useAccountInfo(id: number) {
    const { token } = useAuth()
    const [accountInfo, setAccountInfo] = useState<AccountInfoData | null>(null)

    useEffect(() => {
        if (!token) {
            return
        }

        fetch(`http://127.0.0.1:8001/account/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((result) => {
            if (!result.ok) throw new Error(result.statusText)
            return result.json()
        }).then(setAccountInfo).catch(console.error)
    }, [token, id]);
    return accountInfo;
}

export async function createAccount(name: string, email: string, password: string, description: string, dob: string) {
    fetch(`http://127.0.0.1:8001/account`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({name, email, password, description, dob}),
    }).then((result) => {
        if (!result.ok) {throw new Error(result.statusText);}
        return result.json();
    })
}

export async function deleteAccount(id: number, token: string): Promise<void> {
    await fetch(`http://127.0.0.1:8001/account/${id}`, {
        method: "DELETE",
        headers: {"Authorization": `Bearer ${token}`},
    }).then((result) => {
        if (!result.ok) throw new Error(result.statusText);
    })
}