import {deleteAccount, useAuth} from "../AuthContext.tsx";
import {Label} from "./ui/label.tsx";
import {Button} from "@base-ui/react";

export default function AccountInfo() {
    const { account, token, logout } = useAuth();

    async function handleDelete() {
        if (!account || !token) return;
        await deleteAccount(account.id, token);
        logout();
    }

    if (!account) {
        return <h2>Not logged in, log in above!</h2>;
    } else {
        return (<div className="flex flex-col mx-auto gap-2 max-w-sm items-center">
            <h2>Logged in!</h2>
            <Label>Id: {account.id}</Label>
            <Label>Name: {account.name}</Label>
            <Label>Email: {account.email}</Label>
            <Label>Desc: {account.description}</Label>
            <Label>Dob: {new Date(account.dob).toLocaleDateString()}</Label>
            <Label>JWT Token:</Label>
            <p className="max-w-sm break-all text-xs font-mono text-muted-foreground bg-card-foreground rounded-xl p-2">
                {token}
            </p>
            <Button onClick={handleDelete}>
                Delete Account
            </Button>
        </div>);
    }
}