import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

      const token = res.data.jwt;
      const role = res.data.user.role;
      const username = res.data.user.email;
      const profileImage = res.data.user.profileImage;
      const fullName = res.data.user.fullName;
      const userId = res.data.user.id;

      login(token, role, username, profileImage, fullName, userId);

      if (role === "ROLE_ADMIN" || role === "ROLE_STAFF") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      alert("Sai email hoặc mật khẩu");
    }
};



  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white w-96 p-8 rounded shadow">

        <h2 className="text-2xl font-bold text-center mb-2">
          Chào mừng trở lại
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Đăng nhập để tiếp tục
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className="w-full p-2 border rounded"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-2 relative">
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full p-2 border rounded"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-sm text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </span>
          </div>

          {/* Quên mật khẩu */}
          <div className="text-right mb-4">
            <button
              type="button"
              className="text-sm text-blue-500"
              onClick={() => alert("Chức năng quên mật khẩu chưa làm")}
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Login button */}
          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Đăng nhập
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">
            HOẶC TIẾP TỤC VỚI
          </span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social buttons (UI thôi) */}
        <div className="flex gap-3">
          <button className="flex-1 border p-2 rounded hover:bg-gray-100">
            Google
          </button>
          <button className="flex-1 border p-2 rounded hover:bg-gray-100">
            Facebook
          </button>
        </div>

        <p className="text-center text-sm mt-6">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-500 font-medium">
            Đăng ký ngay
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;