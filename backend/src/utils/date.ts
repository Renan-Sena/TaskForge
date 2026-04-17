export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

export const isOverdue = (dueDate: Date | null): boolean => {
  if (!dueDate) return false;
  return new Date() > dueDate;
};