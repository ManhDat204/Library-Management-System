import { useEffect, useState } from "react";
import axios from "axios";

function OrderComplete() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );

    axios
      .post("http://localhost:8080/api/payments/vnpay-verify", params)
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          setStatus("success");
          setMessage(res.data.message || "Thanh toán thành công!");
        } else {
          setStatus("fail");
          setMessage(res.data.message || "Thanh toán thất bại!");
        }
      })
      .catch((error) => {
        setStatus("fail");
        setMessage(error.response?.data?.message || "Có lỗi xảy ra!");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Đang xử lý thanh toán...
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <a
              href="/"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Quay về trang chủ
            </a>
          </>
        )}

        {status === "fail" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Thanh toán thất bại!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <a
              href="/"
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Quay về trang chủ
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderComplete;
