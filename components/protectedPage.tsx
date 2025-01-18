// components/ProtectedPage.tsx
import { useSession } from "next-auth/react";

const ProtectedPage: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Access Denied</p>;

  return <p>Welcome, {session.user?.name}!</p>;
};

export default ProtectedPage;
