import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";


export default function SignUpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role;

  useEffect(() => {
    if (!role) navigate("/role-selection");
  }, [role, navigate]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const handleSignUp = () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields!");
      return;
    }
    if (!agree) {
      alert("You must agree to the Terms and Conditions");
      return;
    }

    const users = JSON.parse(localStorage.getItem("quizAppUsers")) || [];

    if (users.some((u) => u.email === email && u.role === role)) {
      alert("This email is already registered for this role!");
      return;
    }

    const newUser = { name, email, password, role };
    users.push(newUser);
    localStorage.setItem("quizAppUsers", JSON.stringify(users));

    alert("Sign up successful! You can now log in.");
    navigate("/login", { state: { role } });
  };

  if (!role) return null;

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center relative overflow-hidden p-6">
      <div className="absolute left-0 ">
        <img src="/login.svg" alt="ellipse" />
      </div>

      <Card className="w-full max-w-170 h-[600px] z-10 border-gray-300 rounded-xl shadow-md absolute right-10">
        <CardContent className="p-10">
          <Button
            variant="ghost"
            className="mb-6 text-teal-600 hover:text-teal-800 flex items-center gap-2 "
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
            Select Role
          </Button>
          <h2 className="text-2xl font-semibold text-teal-600 mb-2">
            {role.charAt(0).toUpperCase() + role.slice(1)} Sign Up
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Please enter your details to get started!
          </p>

          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <Input
            className="mt-1 mb-4 bg-gray-200"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            <Checkbox
              id="terms"
              checked={agree}
              onCheckedChange={(checked) => setAgree(checked)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 cursor-pointer"
            >
              I agree to the Terms and Conditions
            </label>
          </div>

          <Button
            onClick={handleSignUp}
            className="w-full bg-teal-200 text-black hover:bg-teal-300"
          >
            Sign Up
          </Button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-medium hover:underline"
              state={{ role }}
            >
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
