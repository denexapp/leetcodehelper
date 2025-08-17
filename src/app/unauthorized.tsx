export default function UnauthorizedPage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Access Required
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access this page and track your coding progress.
          </p>
        </div>
        
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Use the sign in button in the header to authenticate with GitHub.
          </li>
          <li className="tracking-[-.01em]">
            Once signed in, you&apos;ll have access to all features.
          </li>
        </ol>
      </main>
    </div>
  );
}
