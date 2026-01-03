import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role;

  useEffect(() => {
    if (!role) navigate("/");
  }, [role, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("quizAppUsers")) || [];

    const user = users.find(
      (u) => u.email === email && u.password === password && u.role === role
    );

    if (!user) {
      alert("Invalid credentials for this role!");
      return;
    }

    alert(`Welcome back, ${user.name}!`);
    localStorage.setItem("quizAppUser", JSON.stringify(user));
    localStorage.setItem("quizAppLoggedIn", "true");
    localStorage.setItem("quizAppRole", role);

    if (role === "instructor") {
      navigate("/Instructor", { state: { user } });
    } else {
      navigate("/student_dashboard", { state: { user } });
    }
  };

  if (!role) return null;

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center relative overflow-hidden p-6">
      <div className="absolute left-0">
        <img src="/login.svg" alt="ellipse" />
      </div>

      <Card className="w-full max-w-200 h-[700px] z-10 border-gray-300 rounded-xl shadow-md absolute right-10">
        <CardContent className="p-10">
          <h2 className="text-2xl font-semibold text-teal-600 mb-2">
            {role.charAt(0).toUpperCase() + role.slice(1)} Login
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Please enter your Email and Password to get started!!
          </p>

          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            className="mt-1 mb-4 bg-gray-200"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-sm font-medium text-gray-700">Password</label>
          <Input
            className="mt-1 mb-4 bg-gray-200"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center gap-2 mb-6">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Remember this device
            </label>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-teal-200 text-black hover:bg-teal-300"
          >
            Log In
          </Button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Not a member?{" "}
            <Link
              to="/signup"
              className="text-teal-600 font-medium hover:underline"
              state={{ role }}
            >
              Register now
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}