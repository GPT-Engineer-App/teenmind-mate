import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";
import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const { user, logout } = useAuth();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <nav className="bg-gray-800 text-white p-4">
                <ul className="flex space-x-4">
                  {navItems.map(({ title, to, icon }) => (
                    <li key={to}>
                      <Link to={to} className="flex items-center space-x-1 hover:text-gray-300">
                        {icon}
                        <span>{title}</span>
                      </Link>
                    </li>
                  ))}
                  {!user && (
                    <>
                      <li>
                        <Link to="/login" className="hover:text-gray-300">Login</Link>
                      </li>
                      <li>
                        <Link to="/register" className="hover:text-gray-300">Register</Link>
                      </li>
                    </>
                  )}
                  {user && (
                    <>
                      {user.role === 'admin' && (
                        <li>
                          <Link to="/admin" className="hover:text-gray-300">Admin</Link>
                        </li>
                      )}
                      <li>
                        <button onClick={logout} className="hover:text-gray-300">Logout</button>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
              <main className="flex-grow">
                <Routes>
                  {navItems.map(({ to, page }) => (
                    <Route key={to} path={to} element={<ProtectedRoute>{page}</ProtectedRoute>} />
                  ))}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
