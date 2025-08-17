"use client";

import { authClient } from "@/lib/auth/authClient";
import { useState } from "react";

export default function SignInButton({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github"
      });
    } catch (error) {
      console.error("GitHub sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className || "rounded-full border border-solid border-blue-600 bg-blue-600 text-white transition-colors flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm h-10 px-4"}
    >
      {isLoading ? "Signing In..." : "Sign In with GitHub"}
    </button>
  );
}