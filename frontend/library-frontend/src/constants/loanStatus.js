export const LOAN_STATUS_MAP = {
  CHECK_OUT: { 
    label: "Chờ vận chuyển", 
    cls: "bg-blue-50 text-blue-600",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: "📋"
  },
  SHIPPING: { 
    label: "Đang vận chuyển", 
    cls: "bg-indigo-50 text-indigo-600",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
    icon: "🚚"
  },
  DELIVERED: { 
    label: "Đang mượn", 
    cls: "bg-teal-50 text-teal-600",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    dot: "bg-teal-500",
    icon: "📦"
  },
  OVERDUE: { 
    label: "Quá hạn", 
    cls: "bg-rose-50 text-rose-600",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: "⏰"
  },
  PENDING_RETURN: { 
    label: "Chờ duyệt trả", 
    cls: "bg-violet-50 text-violet-600",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    icon: "🔄"
  },
  RETURNED: { 
    label: "Đã trả", 
    cls: "bg-emerald-50 text-emerald-600",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500"
  },
  DAMAGED: { 
    label: "Hư hỏng", 
    cls: "bg-orange-50 text-orange-600",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    icon: "📕"
  },
  LOST: { 
    label: "Mất sách", 
    cls: "bg-gray-100 text-gray-500",
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
    dot: "bg-gray-400",
    icon: "📭"
  },
  CANCELLED: { 
    label: "Đã huỷ", 
    cls: "bg-gray-100 text-gray-400",
    color: "text-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-100",
    dot: "bg-gray-300"
  },
};