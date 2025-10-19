import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google";
import supabase from "@/util/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("Login", { email, password });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    }) as {
      data: { user?: any; session?: { user?: any } };
      error: any;
    };
    const user = data?.user ?? data?.session?.user;
    if (error) {
      console.error("Login error:", error);
    } else {
      console.log("Logged in user:", user);
      navigate("/");
    }
  };


  // const handleGoogleSuccess = async (credentialResponse: any) => {
  //   console.log("Google login token:", credentialResponse.credential);
  // };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 rounded-2xl border bg-card shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to your account
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleLogin} className="w-full">
            Log In
          </Button>
        </div>

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <span className="mx-2">or</span>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            Sign in with Google
          </Button>
          {/* <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Login Failed")} /> */}
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}