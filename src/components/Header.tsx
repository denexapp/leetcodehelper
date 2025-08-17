import Link from "next/link";
import getSession from "@/lib/auth/getSession";
import checkAdmin from "@/lib/auth/checkAdmin";
import SignInButton from "@/components/SignInButton";
import SignOutButton from "@/components/SignOutButton";

export default async function Header() {
  const session = await getSession();
  const isAdmin = await checkAdmin();

  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
            >
              LeetCode Helper
            </Link>
            
            {session?.user && (
              <nav className="flex items-center space-x-6">
                <Link
                  href="/attempts"
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  My Attempts
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
                <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                <SignOutButton />
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
