export const formatAddress = (loan) => {
  const address = loan.address || loan.deliveryAddress || loan.shippingAddress || null;
  const fields = [];

  if (address && typeof address === "object") {
    fields.push(address.street || "");
    fields.push(address.ward || "");
    fields.push(address.district || "");
    fields.push(address.province || "");
  } else {
    fields.push(loan.ward || "");
    fields.push(loan.district || "");
    fields.push(loan.province || "");
  }

  return fields.filter(Boolean).join(", ");
};
