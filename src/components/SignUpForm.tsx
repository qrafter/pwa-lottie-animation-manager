import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useUserStore } from "../stores/useStore";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const { signIn } = useUserStore();

  const handleSubmit = async () => {
    try {
      setIsSigningUp(true);
      signIn(email, password);
    } catch (error) {
      alert((error as Error)?.message);
    } finally {
      setIsSigningUp(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <p>Create an account to sync your animations online.</p>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isSigningUp}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              disabled={isSigningUp}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Create an account
          </Button>
      </form>
    </div>
  );
}
