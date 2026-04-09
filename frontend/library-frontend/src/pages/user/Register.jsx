import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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

    // Validate
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
        await axios.post("http://localhost:8080/auth/signup", {
        email,
        password,
      });

      alert("Đăng ký thành công!");
      navigate("/login");

    } catch (err) {
      setError("Email đã tồn tại hoặc có lỗi xảy ra");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white w-96 p-8 rounded shadow">

        <h2 className="text-2xl font-bold text-center mb-2">
          Tạo tài khoản
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Đăng ký để sử dụng hệ thống
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              placeholder="example@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-2 relative">
            <label className="block mb-1 font-medium">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded"
              placeholder="••••••••"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <span
              className="absolute right-3 top-9 cursor-pointer text-sm text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </span>
          </div>

          <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mt-4">
            Đăng ký
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-center text-sm mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-500 font-medium">
            Đăng nhập
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;