export const LOAN_STATUS_MAP = {
  CHECK_OUT: { label: "Chờ vận chuyển", cls: "bg-blue-50 text-blue-600" },
  SHIPPING: { label: "Đang vận chuyển", cls: "bg-indigo-50 text-indigo-600" },
  DELIVERED: { label: "Đang mượn", cls: "bg-teal-50 text-teal-600" },
  OVERDUE: { label: "Quá hạn", cls: "bg-rose-50 text-rose-600" },
  RETURNED: { label: "Đã trả", cls: "bg-emerald-50 text-emerald-600" },
  LOST: { label: "Mất sách", cls: "bg-gray-100 text-gray-500" },
  DAMAGED: { label: "Hư hỏng", cls: "bg-orange-50 text-orange-600" },
  CANCELLED: { label: "Đã huỷ", cls: "bg-gray-100 text-gray-400" },
  PENDING_RETURN: { label: "Chờ duyệt trả", cls: "bg-violet-50 text-violet-600" },
};
