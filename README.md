# Xử lý thanh toán đơn hàng

Ứng dụng TypeScript chạy trên trình duyệt. Biên nhận được giữ trong bộ nhớ của phiên hiện tại và mất khi tải lại trang. Tất cả thanh toán đều là mô phỏng.

## Cài đặt và chạy

Cần Node.js 20.19+ hoặc 22.12+ và npm. Mở terminal tại thư mục dự án rồi chạy:

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in ra trong terminal, mặc định là `http://localhost:5173`. Chạy `npm run build` để kiểm tra kiểu và tạo bản build trong `dist/`.

## Luồng xử lý

1. `src/main.ts` đọc giá trị form thành `unknown`. `valueAsNumber` cho ra `NaN` khi ô số bị bỏ trống. `isPaymentRequest` từ chối dữ liệu sai trước khi tạo bộ xử lý và thu hẹp kiểu thành `PaymentRequest` khi dữ liệu hợp lệ.
2. Phương thức thanh toán chọn một trong ba lớp `CodPaymentProcessor`, `BankTransferProcessor`, `EWalletPaymentProcessor`. Cả ba kế thừa `PaymentProcessor`, nơi giữ mã đơn và số tiền dưới dạng `private readonly`. Mỗi lớp ghi đè `pay()` và dùng hàm `success()` của lớp cha để cấp mã biên nhận và tạo kết quả kèm thông báo riêng.
3. Form gọi `pay()` qua kiểu cha `PaymentProcessor` rồi kiểm tra `result.status` để đọc dữ liệu hoặc lỗi đúng kiểu. Khi thành công, form thêm biên nhận vào danh sách. Form tra cứu dùng `findById<T>` để nhận biên nhận theo mã hoặc `undefined`.

## Thử nhanh

- Thanh toán đơn **1001** với **250000 VND** bằng **COD**. Sau đó thử chuyển khoản và ví điện tử để kiểm tra thông báo riêng.
- Để trống mã đơn hoặc thử `0`, `-1`, `1.5` ở ô mã đơn. Thử `0` hoặc số âm ở ô số tiền. Trang phải báo lỗi và số biên nhận giữ nguyên.
- Trong DevTools, sửa thuộc tính `value` của lựa chọn đang chọn thành `INVALID` rồi gửi form. Type guard phải từ chối yêu cầu.
- Tra cứu mã biên nhận đã hiển thị, rồi thử một mã chưa có như `9999`.

## GitHub Pages

Bản build tĩnh nằm trong `docs/`. Trong **Settings → Pages**, chọn
**Deploy from a branch**, nhánh **main** và thư mục **/docs**.

Khi sửa mã nguồn, chạy `npm run build -- --base=./` rồi cập nhật nội dung
`docs/` từ `dist/`. Giữ tệp `docs/.nojekyll`.
