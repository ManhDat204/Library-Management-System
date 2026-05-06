import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const REGISTER_IMAGE_URL = "YOUR_IMAGE_URL";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      await axios.post("http://localhost:8080/auth/signup", { email, password });
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch {
      setError("Email đã tồn tại hoặc có lỗi xảy ra");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f0] font-[DM_Sans,sans-serif]">

      {/* ── Left 50%: Form ── */}
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f0] px-14 py-12 max-md:px-6">
        <div className="w-full max-w-[380px]">

          <h1 className="text-[30px] font-extrabold tracking-[2px] text-[#111] leading-none mb-1.5">
            Tạo tài khoản
          </h1>
          <p className="text-sm text-[#888] mb-7">
            Đăng ký để sử dụng hệ thống.
          </p>

          {/* Error banner */}
          {error && (
            <div className="mb-[18px] rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold uppercase tracking-[1px] text-[#444] mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e0e0db] rounded-[10px] bg-white text-sm text-[#111] outline-none transition duration-200 placeholder:text-[#bbb] focus:border-blue-400 focus:ring-[3px] focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold uppercase tracking-[1px] text-[#444] mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-16 border border-[#e0e0db] rounded-[10px] bg-white text-sm text-[#111] outline-none transition duration-200 placeholder:text-[#bbb] focus:border-blue-400 focus:ring-[3px] focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#999] hover:text-blue-500 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold uppercase tracking-[1px] text-[#444] mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e0e0db] rounded-[10px] bg-white text-sm text-[#111] outline-none transition duration-200 placeholder:text-[#bbb] focus:border-blue-400 focus:ring-[3px] focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-[10px] text-[18px] font-extrabold tracking-[2px] transition duration-200 hover:-translate-y-px active:scale-[0.98]"
            >
              Sign up
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-[13px] text-[#888]">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>

      {/* ── Right 50%: Image ── */}
      <div className="relative flex-1 overflow-hidden min-h-screen hidden md:block">
        <img
          src={REGISTER_IMAGE_URL}
          alt="Register visual"
          className="w-full h-full object-cover object-center block"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-11 left-10 right-10 z-10 text-right text-white/80 text-[13px] leading-relaxed">
          {/* tagline để trống như bản gốc */}
        </div>
      </div>

    </div>
  );
};

export default Register;