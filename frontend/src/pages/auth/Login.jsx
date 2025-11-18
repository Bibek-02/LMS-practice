// frontend/src/pages/auth/Login.jsx  
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import useAuth from "../../hooks/useAuth.js";


const Login = () => {
  const [role, setRole] = useState("member"); // member | staff
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        role === "member" ? "/auth/members/login" : "/auth/staff/login";

      const { data } = await apiClient.post(endpoint, { email, password });

      // Expect: { token, profile }
      login({ token: data.token, profile: data.profile });

      const actualRole = data.profile.role;

      if (actualRole === "member") {
        navigate("/member/dashboard", { replace: true });
      } else if (actualRole === "staff") {
        navigate("/staff/dashboard", { replace: true });
      } else if (actualRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Library Login</h1>
        <p className="text-sm text-slate-500 text-center">
          Sign in to your account
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Login as
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="member">Member</option>
              <option value="staff">Staff / Admin</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
