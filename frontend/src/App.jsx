import { useAuth } from "./context/AuthContext.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import TodoDashboard from "./components/TodoDashboard.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <TodoDashboard /> : <AuthScreen />;
}
