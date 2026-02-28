import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Quản lý Thư viện</h2>
      <ul>
        <li className="mb-2">
          <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700">
            Dashboard
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/books" className="block py-2 px-4 rounded hover:bg-gray-700">
            Quản lý sách
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/categories" className="block py-2 px-4 rounded hover:bg-gray-700">
            Quản lý thể loại
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/users" className="block py-2 px-4 rounded hover:bg-gray-700">
            Quản lý người dùng
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/loans" className="block py-2 px-4 rounded hover:bg-gray-700">
            Quản lý mượn trả
          </Link>
        </li>
        <li className="mt-8">
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 px-4 rounded hover:bg-red-700 bg-red-600"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;