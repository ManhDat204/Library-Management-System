import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Heart } from "lucide-react";

function Toast({ message, type = "success", onClose, position = "top", timeout = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, timeout);
    return () => clearTimeout(t);
  }, [onClose, timeout]);

  const colors = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    info: "bg-blue-500",
    remove: "bg-gray-600"
  };

  const positionClass = position === "bottom" 
    ? "bottom-8 right-8" 
    : "top-5 right-5";

  return (
    <div
      className={`fixed ${positionClass} z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-2xl text-sm font-medium ${colors[type] || colors.info}`}
      style={{ animation: "slideIn 0.3s ease" }}
    >
      {type === "success" && <CheckCircle size={18} />}
      {type === "error" && <AlertCircle size={18} />}
      {type === "remove" && <Heart size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;