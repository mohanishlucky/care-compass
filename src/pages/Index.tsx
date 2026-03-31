import { useAuth } from "@/lib/auth-context";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function Index() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <Login />;
}
