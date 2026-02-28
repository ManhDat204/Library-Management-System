import Layout from '../components/Layout';

const Dashboard = () => {
  const stats = {
    totalBooks: 120,
    totalUsers: 50,
    activeLoans: 15,
  };

  // useEffect không cần thiết cho dữ liệu mẫu

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Tổng sách</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Tổng người dùng</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Khoản vay đang hoạt động</h3>
          <p className="text-3xl font-bold text-red-600">{stats.activeLoans}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Dữ liệu gần đây</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Tên sách</th>
              <th className="px-4 py-2 text-left">Người mượn</th>
              <th className="px-4 py-2 text-left">Ngày mượn</th>
              <th className="px-4 py-2 text-left">Ngày trả</th>
            </tr>
          </thead>
          <tbody>
            {/* Dữ liệu mẫu */}
            <tr>
              <td className="border px-4 py-2">Sách A</td>
              <td className="border px-4 py-2">Nguyễn Văn A</td>
              <td className="border px-4 py-2">2023-10-01</td>
              <td className="border px-4 py-2">2023-10-15</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Sách B</td>
              <td className="border px-4 py-2">Trần Thị B</td>
              <td className="border px-4 py-2">2023-10-02</td>
              <td className="border px-4 py-2">2023-10-16</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Dashboard;