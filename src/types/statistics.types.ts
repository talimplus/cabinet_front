export interface DashboardParams {
  centerId?: number;
  fromMonth?: string;
  toMonth?: string;
}

export interface PaymentsStats {
  amountDue: number;
  amountPaid: number;
  remainingAmount: number;
}

export interface ExpensesStats {
  totalAmount: number;
  totalCount: number;
}

export interface PayrollStats {
  amountDue: number;
  amountPaid: number;
  remainingAmount: number;
}

export interface StudentsStats {
  totalCount: number;
  activeCount: number;
  addedCount: number;
  stoppedCount: number;
}

export interface DashboardResponse {
  centerId: number;
  fromMonth: string;
  toMonth: string;
  payments: PaymentsStats;
  expenses: ExpensesStats;
  payroll: PayrollStats;
  students: StudentsStats;
  netCashflow: number;
}
