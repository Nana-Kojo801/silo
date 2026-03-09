import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Toggle like on a post
export const togglePostLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_targetId", (q) =>
        q.eq("userId", userId).eq("targetId", postId)
      )
      .first();

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(postId, { likeCount: Math.max(0, post.likeCount - 1) });
      return { liked: false };
    } else {
      await ctx.db.insert("likes", {
        userId,
        targetId: postId,
        targetType: "post",
        createdAt: Date.now(),
      });
      await ctx.db.patch(postId, { likeCount: post.likeCount + 1 });

      // Notify post author
      if (post.authorId !== userId) {
        await ctx.db.insert("notifications", {
          recipientId: post.authorId,
          type: "like_post",
          actorId: userId,
          postId,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      return { liked: true };
    }
  },
});

// Toggle like on a comment
export const toggleCommentLike = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_targetId", (q) =>
        q.eq("userId", userId).eq("targetId", commentId)
      )
      .first();

    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Comment not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(commentId, { likeCount: Math.max(0, comment.likeCount - 1) });
      return { liked: false };
    } else {
      await ctx.db.insert("likes", {
        userId,
        targetId: commentId,
        targetType: "comment",
        createdAt: Date.now(),
      });
      await ctx.db.patch(commentId, { likeCount: comment.likeCount + 1 });

      // Notify comment author
      if (comment.authorId !== userId) {
        await ctx.db.insert("notifications", {
          recipientId: comment.authorId,
          type: "like_comment",
          actorId: userId,
          commentId,
          postId: comment.postId,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      return { liked: true };
    }
  },
});

// Get liked post IDs for current user (batch check)
export const getUserLikedPostIds = query({
  args: { postIds: v.array(v.string()) },
  handler: async (ctx, { postIds }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const likes = await Promise.all(
      postIds.map((id) =>
        ctx.db
          .query("likes")
          .withIndex("by_userId_targetId", (q) => q.eq("userId", userId).eq("targetId", id))
          .first()
      )
    );

    return postIds.filter((_, i) => !!likes[i]);
  },
});
