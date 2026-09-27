import {createAccount} from "../AuthContext.tsx";
import {useState} from "react";
import {Label} from "./ui/label.tsx";
import {Button} from "@base-ui/react";

export default function CreateAccount() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [description, setDescription] = useState("");
    const [dob, setDob] = useState<string>("2000-01-01");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.SubmitEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await createAccount(name, email, password, description, dob)
        } catch (error) {
            setError(error instanceof Error ? error.message : "ERROR");
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={submit} id="createAccountForm" className="flex flex-col gap-4 max-w-sm mx-auto text-left
        p-6 rounded-xl border border-border shadow-sm bg-card">
            <div className="flex flex-col gap-4 rounded-xl bg-card-background p-6">
                <div className="flex flex-col gap-1.5 rounded-xl bg-card-foreground p-2">
                    <Label htmlFor={name}>Name</Label>
                    <input
                        className="rounded-xl p-0.5"
                        id = "name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Name"/>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl bg-card-foreground p-2">
                    <Label htmlFor={email}>Email</Label>
                    <input
                        className="rounded-xl p-0.5"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@provider.com"/>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl bg-card-foreground p-2">
                    <Label htmlFor={password}>Password</Label>
                    <input
                        className="rounded-xl p-0.5"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password123!"/>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl bg-card-foreground p-2">
                    <Label htmlFor={description}>Description</Label>
                    <input
                        className="rounded-xl p-0.5"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter Description"/>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl bg-card-foreground p-2">
                    <Label htmlFor={dob}>Date of Birth</Label>
                    <input
                        className="rounded-xl p-0.5"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        placeholder="Date"/>
                </div>
                <Button type="submit" disabled={loading} className="border rounded-xl p-1 bg-card-background">{loading ? "Creating..." : "Create Account"}</Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        </form>
    )
}