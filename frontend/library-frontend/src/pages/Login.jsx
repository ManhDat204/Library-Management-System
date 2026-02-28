import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Giả lập login cho tài khoản mẫu (để test frontend)
    if (email === 'admin@library.com' && password === 'admin123') {
      // Giả lập token
      const fakeToken = 'fake-jwt-token-for-testing';
      localStorage.setItem('token', fakeToken);
      navigate('/');
      return;
    }
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;

      // Lưu token vào localStorage
      localStorage.setItem('token', token);

      // Chuyển sang Dashboard
      navigate('/');
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
          <p className="text-gray-600">Hệ thống quản lý thư viện</p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 font-semibold text-lg"
          >
            Đăng nhập
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Tài khoản mẫu:</p>
          <p>Email: admin@library.com</p>
          <p>Mật khẩu: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;