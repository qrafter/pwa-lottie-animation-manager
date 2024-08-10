import React from "react";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LazyLoadingSkeleton from "@/components/LazyLoadingSkeleton";

const UserAnimation = React.lazy(() => import("@/pages/UserAnimation"));
const UserAnimations = React.lazy(() => import("@/pages/UserAnimations"));
const UploadAnimation = React.lazy(() => import("@/pages/UploadAnimation"));

function App() {
  const isOnline = useOnlineStatus();

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

            <nav></nav>
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

          {/* <Routes>
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
              path="/upload"
              element={
                <Suspense fallback={<LazyLoadingSkeleton />}>
                  <UploadAnimation />
                </Suspense>
              }
            />
            <Route
              path="/featured"
              element={
                <Suspense fallback={<LazyLoadingSkeleton />}>
                  <FeaturedAnimations />
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
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/animations" replace />} />
          </Routes> */}
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto p-6 text-center">
          © 2023 Lottie Animation Manager
        </div>
      </footer>
    </div>
  );
}

export default App;
