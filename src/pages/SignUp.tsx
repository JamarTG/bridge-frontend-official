import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup({ prefillEmail = "", prefillName = "" }) {
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("en"); // Default to English

  const navigate = useNavigate();

  const handleSignup = async () => {
    console.log({ name, email, password });
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,

        password: password,
        languagePreference: language,
        //supabaseUserId: UUID.v4().toString(),
        // Assuming password and supabaseUserId are handled elsewhere or not needed for this specific signup
      }),
    });

    if (response.ok) {
      console.log("User registered successfully!");
      navigate("/login");
    } else {
      alert("Failed to register user:");
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 rounded-2xl border bg-card shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up to continue
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              placeholder="Enter your email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
              <SelectGroup>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">Chinese (Mandarin)</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSignup} className="w-full">
            Sign Up
          </Button>
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}