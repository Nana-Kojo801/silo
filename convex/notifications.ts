import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List notifications for current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId_createdAt", (q) => q.eq("recipientId", userId))
      .order("desc")
      .take(50);

    // Hydrate with actor profiles
    return await Promise.all(
      notifications.map(async (n) => {
        let actorProfile = null;
        if (n.actorId) {
          actorProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", n.actorId!))
            .first();
        }

        let post = null;
        if (n.postId) {
          post = await ctx.db.get(n.postId);
        }

        return { ...n, actorProfile, post };
      })
    );
  },
});

// Get unread count
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId_isRead", (q) =>
        q.eq("recipientId", userId).eq("isRead", false)
      )
      .take(100);

    return unread.length;
  },
});

// Mark all as read
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId_isRead", (q) =>
        q.eq("recipientId", userId).eq("isRead", false)
      )
      .take(100);

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
  },
});

// Mark single notification as read
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const n = await ctx.db.get(notificationId);
    if (!n || n.recipientId !== userId) throw new Error("Not found");

    await ctx.db.patch(notificationId, { isRead: true });
  },
});
