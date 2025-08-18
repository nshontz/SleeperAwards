import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="page-container">
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Welcome to BineTime</h1>
          
          <div className="space-y-6">
            <p className="text-white text-center">
              Sign in to access your fantasy football teams and track your performance.
            </p>

            <Link
              href="/api/auth/login"
              className="w-full bg-hop-gold text-hop-brown px-4 py-3 rounded font-semibold text-center block"
            >
              Sign In with Kinde
            </Link>

            <div className="text-center text-gray-300 text-sm">
              <p>Secure authentication powered by Kinde</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}