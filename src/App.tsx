import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { NotesApp } from "./NotesApp";
import { ShadcnDemo } from "./ShadcnDemo";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">📝 Notes</h1>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Content />
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Authenticated>
        <NotesApp />
      </Authenticated>
      
      <Unauthenticated>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Notes
          </h2>
          <p className="text-gray-600 mb-8">
            A simple, clean note-taking app. Sign in to get started.
          </p>
          <SignInForm />
          
          {/* Shadcn UI Demo */}
          <div className="mt-16 border-t pt-8">
            <ShadcnDemo />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
