import { httpRouter } from "convex/server";
import { api } from "./_generated/api";

/**
 * Router cho API HTTP.
 *
 * Routing cho các endpoints HTTP nội bộ của Convex.
 * Tham khảo: https://docs.convex.dev/functions/http-actions
 */
const http = httpRouter();

// Đây là router chính - nó sẽ chuyển tiếp các HTTP requests
export default http;
