import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import client from "../api/client";

export function useAuth() {
  const { token, user, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const signIn = async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    login(res.data.access_token, res.data.user);
    navigate("/");
  };

  const signUp = async (email, password, full_name) => {
    const res = await client.post("/auth/register", { email, password, full_name });
    login(res.data.access_token, res.data.user);
    navigate("/");
  };

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return { token, user, signIn, signUp, signOut };
}
