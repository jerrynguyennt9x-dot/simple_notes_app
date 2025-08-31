/**
 * Http handler cho Convex.
 *
 * Tệp này phải xuất (export default) một đối tượng httpRouter.
 */

import { httpRouter } from "convex/server";

/**
 * Router HTTP cho endpoints có sẵn từ web.
 *
 * Mọi route phải đề cập đến một httpAction được xuất từ một file khác.
 * Tham khảo: https://docs.convex.dev/functions/http-actions
 */
const http = httpRouter();

// Thêm một route đơn giản
http.route({
  path: "/hello",
  method: "GET",
  handler: async () => {
    return new Response("Hello from Convex!", {
      status: 200,
    });
  },
});

export default http;
