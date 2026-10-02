export interface TransactionLastData {
  baseAmount: number;
  baseCurrency: string;
}

export interface LastTransactionResponse {
  transaction: {
    base_amount: string;
    base_currency: string;
  };
  messageTransaction?: string;
}