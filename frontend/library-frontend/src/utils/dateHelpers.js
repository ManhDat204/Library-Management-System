export const todayStr = () => new Date().toISOString().split("T")[0];

export const calculateOverdueDays = (dueDate, returnDate) => {
  if (!dueDate) return 0;
  const dueDateObj = new Date(dueDate);
  const retDateObj = new Date(returnDate);
  return dueDateObj && retDateObj > dueDateObj
    ? Math.floor((retDateObj - dueDateObj) / 86400000)
    : 0;
};

export const calculateDaysBorrowed = (checkoutDate) => {
  if (!checkoutDate) return 0;
  return Math.floor((new Date() - new Date(checkoutDate)) / 86400000);
};
