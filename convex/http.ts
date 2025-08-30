import { httpAction } from "./_generated/server";

// HTTP action đơn giản để test API
export const hello = httpAction(async ({ runQuery, runMutation }, request) => {
  return new Response("Hello from Convex API!", {
    status: 200,
  });
});
