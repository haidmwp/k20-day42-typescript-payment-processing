import "./style.css";
import {
  BankTransferProcessor,
  CodPaymentProcessor,
  EWalletPaymentProcessor,
  findById,
  isPaymentRequest,
  type PaymentMethod,
  type PaymentProcessor,
  type PaymentReceipt,
} from "./payment";

const processors = {
  COD: CodPaymentProcessor,
  BANK_TRANSFER: BankTransferProcessor,
  E_WALLET: EWalletPaymentProcessor,
} satisfies Record<PaymentMethod, typeof CodPaymentProcessor>;

const methodLabels: Record<PaymentMethod, string> = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
  E_WALLET: "Ví điện tử",
};

const amountFormat = new Intl.NumberFormat("vi-VN", { maximumSignificantDigits: 21 });

function describeReceipt(receipt: PaymentReceipt): string {
  return [
    `Biên nhận #${receipt.id}`,
    `Đơn hàng #${receipt.orderId}`,
    `${amountFormat.format(receipt.amount)} ₫`,
    methodLabels[receipt.method],
  ].join(" · ");
}

function showResult(element: HTMLElement, message: string, status: "success" | "error") {
  element.textContent = message;
  element.dataset.status = status;
}

function initialize() {
  const paymentForm = document.querySelector<HTMLFormElement>("#payment-form");
  const orderIdInput = document.querySelector<HTMLInputElement>("#order-id");
  const amountInput = document.querySelector<HTMLInputElement>("#amount");
  const methodSelect = document.querySelector<HTMLSelectElement>("#method");
  const paymentStatus = document.querySelector<HTMLParagraphElement>("#payment-status");
  const receiptList = document.querySelector<HTMLUListElement>("#receipts");
  const emptyList = document.querySelector<HTMLParagraphElement>("#empty-list");
  const searchForm = document.querySelector<HTMLFormElement>("#search-form");
  const receiptIdInput = document.querySelector<HTMLInputElement>("#receipt-id");
  const searchStatus = document.querySelector<HTMLParagraphElement>("#search-status");

  if (
    !paymentForm || !orderIdInput || !amountInput || !methodSelect || !paymentStatus ||
    !receiptList || !emptyList || !searchForm || !receiptIdInput || !searchStatus
  ) {
    throw new Error("Thiếu thành phần bắt buộc trên trang thanh toán.");
  }

  const receipts: PaymentReceipt[] = [];

  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input: unknown = {
      orderId: orderIdInput.valueAsNumber,
      amount: amountInput.valueAsNumber,
      method: methodSelect.value,
    };

    if (!isPaymentRequest(input)) {
      showResult(
        paymentStatus,
        "Dữ liệu không hợp lệ. Nhập mã đơn là số nguyên dương, số tiền lớn hơn 0 và chọn phương thức hợp lệ.",
        "error",
      );
      return;
    }

    const Processor = processors[input.method];
    const processor: PaymentProcessor = new Processor(input.orderId, input.amount);
    const result = processor.pay();

    if (result.status === "error") {
      showResult(paymentStatus, result.message, "error");
      return;
    }

    const receipt = result.data;
    receipts.push(receipt);
    const row = document.createElement("li");
    row.textContent = describeReceipt(receipt);
    receiptList.prepend(row);
    emptyList.hidden = true;
    showResult(paymentStatus, `${receipt.message}\n${describeReceipt(receipt)}`, "success");
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = receiptIdInput.valueAsNumber;
    if (!Number.isInteger(id) || id <= 0) {
      showResult(searchStatus, "Mã biên nhận phải là số nguyên dương.", "error");
      return;
    }

    const receipt = findById(receipts, id);
    if (receipt === undefined) {
      showResult(searchStatus, `Không tìm thấy biên nhận #${id}.`, "error");
      return;
    }
    showResult(searchStatus, `${describeReceipt(receipt)}\n${receipt.message}`, "success");
  });
}

initialize();
