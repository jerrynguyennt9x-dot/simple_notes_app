import { auth } from "./auth";
import { httpAction } from "./_generated/server";

// Tạo action HTTP
export const post = httpAction(async (ctx, request) => {
  // Xử lý HTTP POST request
  return new Response("API route works", {
    status: 200,
  });
});

// Đảm bảo auth routes được thêm vào
// (không cần phải thêm vào router ở đây vì đã được xử lý trong router.ts)
