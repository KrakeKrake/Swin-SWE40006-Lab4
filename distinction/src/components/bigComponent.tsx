import { useState } from "react";
import LoginButton from "./loginButton.tsx";
import AccountInfo from "./accountInfo.tsx";
import { AuthProvider } from "../AuthContext.tsx";
import CreateAccount from "./createAccount.tsx";
import { Switch } from "./ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";

export default function BigComponent() {
    const [create, setCreate] = useState(false);

    return (
        <>
            <div className="flex w-fit mx-auto items-center justify-center gap-2 rounded-xl
            border border-border bg-card-foreground p-1">
                <Label htmlFor="LogOrSignIn">Log In</Label>
                <Switch id="LogOrSignIn" checked={create} onCheckedChange={setCreate} style={{ colorScheme: "violet" }}/>
                <Label htmlFor="LogOrSignIn">Sign Up</Label>
            </div>
            <br/>
            <AuthProvider>
                {create ? <CreateAccount /> : <LoginButton />}
                <AccountInfo />
            </AuthProvider>
        </>
    );
}