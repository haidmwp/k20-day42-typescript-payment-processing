export type PaymentMethod = "COD" | "BANK_TRANSFER" | "E_WALLET";

export type PaymentRequest = {
  orderId: number;
  amount: number;
  method: PaymentMethod;
};

export type PaymentReceipt = PaymentRequest & {
  id: number;
  message: string;
};

export type PaymentResult =
  | { status: "success"; data: PaymentReceipt }
  | { status: "error"; message: string };

export function isPaymentRequest(value: unknown): value is PaymentRequest {
  if (typeof value !== "object" || value === null) return false;
  if (!("orderId" in value) || !("amount" in value) || !("method" in value)) {
    return false;
  }

  const { orderId, amount, method } = value;
  return (
    typeof orderId === "number" &&
    Number.isInteger(orderId) &&
    orderId > 0 &&
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    (method === "COD" || method === "BANK_TRANSFER" || method === "E_WALLET")
  );
}

export function findById<T extends { id: number }>(
  items: T[],
  id: number,
): T | undefined {
  return items.find((item) => item.id === id);
}

export abstract class PaymentProcessor {
  private static nextReceiptId = 1;

  constructor(
    private readonly orderId: number,
    private readonly amount: number,
  ) {}

  abstract pay(): PaymentResult;

  protected success(method: PaymentMethod, message: string): PaymentResult {
    return {
      status: "success",
      data: {
        id: PaymentProcessor.nextReceiptId++,
        orderId: this.orderId,
        amount: this.amount,
        method,
        message,
      },
    };
  }
}

export class CodPaymentProcessor extends PaymentProcessor {
  override pay(): PaymentResult {
    return this.success("COD", "Thanh toán COD thành công. Thu tiền khi giao hàng.");
  }
}

export class BankTransferProcessor extends PaymentProcessor {
  override pay(): PaymentResult {
    return this.success("BANK_TRANSFER", "Thanh toán thành công qua chuyển khoản (mô phỏng).");
  }
}

export class EWalletPaymentProcessor extends PaymentProcessor {
  override pay(): PaymentResult {
    return this.success("E_WALLET", "Thanh toán thành công qua ví điện tử (mô phỏng).");
  }
}
