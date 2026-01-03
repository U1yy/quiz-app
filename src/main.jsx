import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import QuizApp from "./pages/QuizApp";
import Profile from "./pages/Profile";
import StudentResults from "./pages/StudentResults";
import Instructor from "./pages/Instructor";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/student_dashboard" element={<QuizApp />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/student-results" element={<StudentResults />} />
      <Route path="/Instructor" element={<Instructor />} />
    </Routes>
  </BrowserRouter>
);