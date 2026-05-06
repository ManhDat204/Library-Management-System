import { AlertCircle } from "lucide-react";

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      {children}
      {error && (
        <span className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </span>
      )}
    </div>
  );
}

export default Field;
