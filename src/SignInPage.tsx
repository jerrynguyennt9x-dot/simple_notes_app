"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../convex/_generated/api";

export function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const from = location.state?.from?.pathname || "/dashboard";
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  
  // Force redirect if user is already logged in
  useEffect(() => {
    if (loggedInUser) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [loggedInUser, navigate]);
  
  // This will add debug information to help diagnose the issue
  console.log("SignInPage: Auth state:", 
    loggedInUser === undefined ? "loading" : 
    loggedInUser === null ? "not authenticated" : "authenticated");
  console.log("SignInPage: Redirect target:", from);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    console.log("Attempting to sign in with flow:", flow);
    
    void signIn("password", formData)
      .then((result) => {
        console.log("Sign in successful, result:", result);
        console.log("Explicitly navigating to /dashboard");
        
        // Force navigation to dashboard
        navigate("/dashboard");
        
        setSubmitting(false);
      })
      .catch((error) => {
        console.error("Sign in error:", error);
        let toastTitle = "";
        if (error.message.includes("Invalid password")) {
          toastTitle = "Invalid password. Please try again.";
        } else {
          toastTitle =
            flow === "signIn"
              ? "Could not sign in, did you mean to sign up?"
              : "Could not sign up, did you mean to sign in?";
        }
        toast.error(toastTitle);
        setSubmitting(false);
      });
  };

  // Handle anonymous sign-in
  const handleAnonymousSignIn = () => {
    setSubmitting(true);
    console.log("Attempting anonymous sign-in");
    
    void signIn("anonymous")
      .then((result) => {
        console.log("Anonymous sign in successful, result:", result);
        console.log("Explicitly navigating to /dashboard");
        
        // Force navigation to dashboard
        navigate("/dashboard");
        
        setSubmitting(false);
      })
      .catch(error => {
        console.error("Anonymous sign in error:", error);
        toast.error("Could not sign in anonymously");
        setSubmitting(false);
      });
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Authenticated>
        {/* If already authenticated, redirect to the dashboard or previous location */}
        <Navigate to={from} replace />
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
          
          {/* Sign In Form (integrated directly) */}
          <div className="w-full">
            <form className="flex flex-col gap-form-field" onSubmit={handleSubmit}>
              <input
                className="auth-input-field"
                type="email"
                name="email"
                placeholder="Email"
                required
              />
              <input
                className="auth-input-field"
                type="password"
                name="password"
                placeholder="Password"
                required
              />
              <Button className="w-full" type="submit" disabled={submitting}>
                {flow === "signIn" ? "Sign in" : "Sign up"}
              </Button>
              <div className="text-center text-sm text-secondary">
                <span>
                  {flow === "signIn"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                </span>
                <button
                  type="button"
                  className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
                  onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                >
                  {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
                </button>
              </div>
            </form>
            
            <div className="flex items-center justify-center my-3">
              <hr className="my-4 grow border-gray-200" />
              <span className="mx-4 text-secondary">or</span>
              <hr className="my-4 grow border-gray-200" />
            </div>
            
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={handleAnonymousSignIn}
              disabled={submitting}
            >
              Sign in anonymously
            </Button>
          </div>
          
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
