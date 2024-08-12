import React, { useEffect, useState } from "react";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Routes, Route, Link } from "react-router-dom";
import { Suspense } from "react";
import LazyLoadingSkeleton from "@/components/LazyLoadingSkeleton";
import { useUserStore } from "./stores/useStore";
import { Button } from "./components/ui/button";
import { AuthModal } from "./components/AuthModal";

const UserAnimation = React.lazy(() => import("@/pages/UserAnimation"));
const UserAnimations = React.lazy(() => import("@/pages/UserAnimations"));
const UploadAnimation = React.lazy(() => import("@/pages/UploadAnimation"));

function App() {
  const isOnline = useOnlineStatus();
  const { localUser } = useUserStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { initializeLocalUser, isInitialized, signOut } = useUserStore();

  useEffect(() => {
    initializeLocalUser();
  }, []);

  const handleSignout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Optionally, redirect to home page or login page after logout
      // history.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignIn = () => {
    setIsAuthModalOpen(true);
  }

  if (!isInitialized) {
    return <LazyLoadingSkeleton />;
  }

  console.log(localUser);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isOnline ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>

            <nav>
              {localUser?.onlineUserId ? (
                <Button variant="outline" onClick={handleSignout}>
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </Button>
              ) : (
                <Button variant="outline" onClick={handleSignIn}>Sign In</Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto p-6">
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<LazyLoadingSkeleton />}>
                  <UserAnimations />
                </Suspense>
              }
            />
            <Route
              path="/animations"
              element={
                <Suspense fallback={<LazyLoadingSkeleton />}>
                  <UserAnimations />
                </Suspense>
              }
            />
            <Route
              path="/animations/:id"
              element={
                <Suspense fallback={<LazyLoadingSkeleton />}>
                  <UserAnimation />
                </Suspense>
              }
            />
            <Route
              path="/upload"
              element={
                <Suspense fallback={<LazyLoadingSkeleton />}>
                  <UploadAnimation />
                </Suspense>
              }
            />
          </Routes>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto p-6 text-center">
          © 2023 Lottie Animation Manager
        </div>
      </footer>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
