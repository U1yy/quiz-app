import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    navigate("/signup", { state: { role } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-col items-center pt-20 pb-10">
        <h1 className="text-3xl font-bold mb-3 text-center">
          Welcome! Choose your role.
        </h1>
        <p className="text-gray-600 text-center mb-10">
          QuizMaster is a web-based application designed for secure and organized online quizzes. <br /> 
          It supports instructors in managing assessments and students in taking timed quizzes.
        </p>

        <div className="flex gap-10">
          {/* Student */}
          <div
            onClick={() => handleRoleClick("student")}
            className="w-56 h-40 bg-teal-50 border rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition"
          >
            <img src="/student.png" alt="Student" className="w-16 h-16 mb-3" />
            <p className="text-gray-700 font-medium">Student</p>
          </div>

          {/* Instructor */}
          <div
            onClick={() => handleRoleClick("instructor")}
            className="w-56 h-40 bg-teal-50 border rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition"
          >
            <img src="/instructor.png" alt="Instructor" className="w-16 h-16 mb-3" />
            <p className="text-gray-700 font-medium">Instructor</p>
          </div>
        </div>
      </div>

      {/* Illustration */}
      <div className="w-full bg-gray-100 h-[510px] relative overflow-hidden">
        <div className="absolute right-0 bottom-0">
          <img src="/ellipse_right.png" alt="ellipse" />
        </div>
        <div className="absolute left-0 bottom-0">
          <img src="/ellipse_left.png" alt="ellipse" />
        </div>
        <img
          src="/illustration.svg"
          alt="Illustration"
          className="relative w-full h-full object-contain z-10"
        />
      </div>
    </div>
  );
}
