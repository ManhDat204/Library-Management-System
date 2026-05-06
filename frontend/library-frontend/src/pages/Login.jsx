import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const LOGIN_IMAGE_URL = "YOUR_IMAGE_URL";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/auth/login", { email, password });
      const token = res.data.jwt;
      const role = res.data.user.role;
      const username = res.data.user.email;
      const profileImage = res.data.user.profileImage;
      const fullName = res.data.user.fullName;
      const userId = res.data.user.id;
      login(token, role, username, profileImage, fullName, userId);
      if (role === "ROLE_ADMIN" || role === "ROLE_STAFF") navigate("/dashboard");
      else navigate("/home");
    } catch {
      alert("Sai email hoặc mật khẩu");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f0] font-[Plus_Jakarta_Sans,sans-serif]">

      {/* ── Left 50%: Image ── */}
      <div className="relative flex-1 overflow-hidden min-h-screen hidden md:block">
        <img
          src={LOGIN_IMAGE_URL}
          alt="Login visual"
          className="w-full h-full object-cover object-center block"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-11 left-10 right-10 z-10 text-white/80 text-[13px] leading-relaxed">
          <strong className="block text-[22px] font-extrabold tracking-[0.5px] text-white mb-1">
            Welcome Back!
          </strong>
          Train smarter. Track progress. Reach your peak.
        </div>
      </div>

      {/* ── Right 50%: Form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-14 py-12 max-md:px-6">
        <div className="w-full max-w-[380px]">

          <h1 className="text-[28px] font-extrabold text-[#111] mb-1.5">
            Welcome back
          </h1>
          <p className="text-sm text-[#888] font-normal mb-8">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="mb-[18px]">
              <label className="block text-sm font-semibold text-[#333] mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-[10px] bg-[#fafafa] text-sm text-[#111] outline-none transition duration-200 placeholder:text-[#bbb] placeholder:font-normal focus:border-blue-400 focus:bg-white focus:ring-[3px] focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="mb-[18px]">
              <label className="block text-sm font-semibold text-[#333] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-16 border border-[#e5e5e5] rounded-[10px] bg-[#fafafa] text-sm text-[#111] outline-none transition duration-200 placeholder:text-[#bbb] placeholder:font-normal focus:border-blue-400 focus:bg-white focus:ring-[3px] focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#999] hover:text-blue-500 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mb-6 text-[13px]">
              <label className="flex items-center gap-[7px] text-[#555] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-[15px] h-[15px] accent-blue-500 cursor-pointer"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => alert("Chức năng quên mật khẩu chưa làm")}
                className="text-blue-500 font-semibold hover:underline"
              >
                Forgot password
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 mb-3 bg-blue-500 hover:bg-blue-600 text-white rounded-[10px] text-[15px] font-bold transition duration-200 hover:-translate-y-px active:scale-[0.98]"
            >
              Sign in
            </button>
          </form>

          {/* Google */}
          <button
            type="button"
            className="w-full py-3 flex items-center justify-center gap-2.5 bg-white border border-[#e5e5e5] rounded-[10px] text-sm font-semibold text-[#333] hover:bg-[#fafafa] hover:border-[#ccc] transition duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="text-center mt-6 text-[13px] text-[#888] font-normal">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 font-bold hover:underline">
              Sign up for free!
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;