import { httpRouter } from "convex/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Định nghĩa các API endpoints cho HTTP router
http.route({
  path: "/api",
  method: "POST",
  handler: api.http.post,
});

export default http;
