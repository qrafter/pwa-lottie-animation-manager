import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useUserStore } from "../stores/useStore";

type SignUpFormProps = {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { signIn, error } = useUserStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      setIsLoggingIn(true);
      await signIn(email, password);
      onSuccess?.();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p>Enter your email below to login to your account.</p>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          disabled={isLoggingIn}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          disabled={isLoggingIn}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <p className="text-red-500">{(error)}</p>
      <Button type="submit" className="w-full mt-4" disabled={isLoggingIn}>
        {isLoggingIn ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}