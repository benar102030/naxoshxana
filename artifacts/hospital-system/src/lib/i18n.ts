export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ku-IQ").format(amount) + " د.ع";
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = [
    "کانوونی دووەم",
    "شوبات",
    "ئادار",
    "نیسان",
    "ئایار",
    "حوزەیران",
    "تەمووز",
    "ئاب",
    "ئەیلوول",
    "تشرینی یەکەم",
    "تشرینی دووەم",
    "کانوونی یەکەم",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatTime = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} - ${formatTime(dateString)}`;
};
