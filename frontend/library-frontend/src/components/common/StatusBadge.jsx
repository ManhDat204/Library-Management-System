import { LOAN_STATUS_MAP } from "../../constants/loanStatus";

function StatusBadge({ status }) {
  const { label, cls } = LOAN_STATUS_MAP[status] || {
    label: status,
    cls: "bg-gray-100 text-gray-500"
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
