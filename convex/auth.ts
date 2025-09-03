import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    console.log("--- loggedInUser query ---");
    const userId = await getAuthUserId(ctx);
    console.log("userId:", userId);
    if (!userId) {
      console.log("userId is null, returning null");
      return null;
    }
    const user = await ctx.db.get(userId);
    console.log("user:", user);
    if (!user) {
      console.log("user is null, returning null");
      return null;
    }
    console.log("returning user:", user);
    return user;
  },
});
