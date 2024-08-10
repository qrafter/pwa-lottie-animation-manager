import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LazyLoadingSkeleton from "./components/LazyLoadingSkeleton";
import React from "react";

const UserAnimations = React.lazy(() => import("@/pages/UserAnimations"));

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

            <nav>
              {/* <ul className="flex space-x-4">
                  <li>
                    <Link
                      to="/animations"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/featured"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Featured
                    </Link>
                  </li>
                </ul> */}
            </nav>

            {/* {user ? (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            )} */}
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
