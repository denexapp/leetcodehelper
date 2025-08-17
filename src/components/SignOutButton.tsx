"use client";

import { authClient } from "@/lib/auth/authClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          }
        }
      });
    } catch (error) {
      console.error("Sign-out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={className || "rounded-full border border-solid border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm h-10 px-4"}
    >
      {isLoading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
