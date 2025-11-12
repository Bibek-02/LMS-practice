// src/utils/circulationUtils.js
export const LOAN_PERIOD_DAYS = 14;
export const DAILY_FINE_RATE = 5;
export const isOverdue = (loan) =>
    !loan.return_date && new Date() > new Date(loan.due_date);


// whole days late; minimum 0
export const overdueDays = (dueDate, asOf = new Date()) => {
  const diffMs = new Date(asOf).setHours(0,0,0,0) - new Date(dueDate).setHours(0,0,0,0);
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

export const fineAmount = (dueDate, asOf = new Date(), rate = DAILY_FINE_RATE) =>
  overdueDays(dueDate, asOf) * rate;