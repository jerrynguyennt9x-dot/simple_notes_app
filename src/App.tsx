import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { NotesApp } from "./NotesApp";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SharedNote } from "./SharedNote";
import { SignInPage } from "./SignInPage";
import { Button } from "./components/ui/button";
import { HomePage } from "./HomePage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Routes>
          <Route path="/shared/:shareId" element={<SharedNoteLayout />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/databoard" element={<MainLayout />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

// Layout cho trang chính
function MainLayout() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const navigate = useNavigate();
  
  console.log("MainLayout: loggedInUser state:", loggedInUser);
  
  // Nếu không được xác thực, chuyển hướng về trang đăng nhập
  if (loggedInUser === null) {
    console.log("MainLayout: User not authenticated, redirecting to /signin");
    return <Navigate to="/signin" replace />;
  }
  
  // Đang tải
  if (loggedInUser === undefined) {
    console.log("MainLayout: Still loading user data");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

// Layout cho trang chia sẻ ghi chú
function SharedNoteLayout() {
  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SharedNote />
      </div>
    </main>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const navigate = useNavigate();

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
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/signin')}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
