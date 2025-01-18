// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Toaster } from 'react-hot-toast';

const noAuthRequiredRoutes = ["/", "/confirm/page/[email]","/auth/signin"]; // Public pages

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isPublicRoute = noAuthRequiredRoutes.includes(router.pathname);

  return (
    <SessionProvider session={pageProps.session}>
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
            <Toaster  />

    </SessionProvider>
  );
}

// Component to protect routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>; // Show a loading spinner
  }

  if (!session) {
    // Redirect to login page if not authenticated
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
    return null;
  }

  return <>{children}</>;
}
