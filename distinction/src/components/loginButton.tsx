import {useAuth} from "../AuthContext.tsx";
import {useState} from "react";
import {Label} from "./ui/label.tsx";
import {Button} from "@base-ui/react";


export default function LoginButton() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.SubmitEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await login(email, password);
        } catch (error) {
            setError(error instanceof Error ? error.message : "ERROR");
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={submit} id="loginAccountForm" className="flex flex-col gap-4 max-w-sm mx-auto text-left
        p-6 rounded-xl border border-border shadow-sm bg-card">

            <div className="flex flex-col gap-4 rounded-xl bg-card-background p-6">
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password123!"/>
                </div>
                <Button type="submit" disabled={loading} className="border rounded-xl p-1 bg-card-background">{loading ? "Logging in..." : "Log in"}</Button>
                {error && <p style={{ color:"red"}}>{error}</p>}
            </div>

        </form>

    )
}