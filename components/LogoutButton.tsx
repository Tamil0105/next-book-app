// components/LogoutButton.tsx
import { Button } from "antd";
import { signOut } from "next-auth/react";

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" }); // Redirect to the homepage after logout
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
