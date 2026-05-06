export const getStatus = (loan) => loan.bookLoanStatus || loan.status;
export const isPending = (s) => s === "PENDING_RETURN";
export const isCheckOut = (s) => s === "CHECK_OUT";
