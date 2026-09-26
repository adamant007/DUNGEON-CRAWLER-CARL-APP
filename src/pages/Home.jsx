import React from "react";
import { Navigate } from "react-router-dom";
import NewUserHome from "@/components/home/NewUserHome";
import { useAuth } from "@/lib/AuthContext";

/* Browser visitors get the public Ginger Dragon landing page. The installed
   Android app skips that marketing step: an existing session goes straight
   to the dashboard, otherwise the app opens the sign-in screen. */
export default function Home() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const isNative =
    typeof window !== "undefined" &&
    Boolean(window.Capacitor?.isNativePlatform?.());

  if (isNative && !isLoadingAuth) {
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
  }

  return <NewUserHome />;
}
