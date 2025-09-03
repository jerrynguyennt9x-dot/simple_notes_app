"use client";
import { SignInForm } from "./SignInForm";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { useEffect } from "react";

export function SignInPage() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  useEffect(() => {
    console.log("SignInPage: loggedInUser state:", loggedInUser);
    if (loggedInUser) {
      console.log("User is authenticated, should redirect to /databoard");
    }
  }, [loggedInUser]);

  // Log pre-render
  useEffect(() => {
    console.log("SignInPage rendered");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Authenticated>
        {/* Nếu đã đăng nhập, chuyển hướng về trang databoard */}
        <Navigate to="/databoard" replace />
      </Authenticated>
      
      <Unauthenticated>
        <div className="w-full max-w-md px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Notes</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome Back
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in to access your notes
            </p>
          </div>
          
          <SignInForm />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
