import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get top-level comments for a post
export const listByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId_createdAt", (q) => q.eq("postId", postId))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .order("asc")
      .take(100);

    return await Promise.all(
      comments.map(async (comment) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", comment.authorId))
          .first();

        const userId = await getAuthUserId(ctx);
        let liked = false;
        if (userId) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_userId_targetId", (q) =>
              q.eq("userId", userId).eq("targetId", comment._id)
            )
            .first();
          liked = !!like;
        }

        return { ...comment, authorProfile: profile, liked };
      })
    );
  },
});

// Get replies for a comment
export const listReplies = query({
  args: { parentId: v.id("comments") },
  handler: async (ctx, { parentId }) => {
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
      .order("asc")
      .take(50);

    return await Promise.all(
      replies.map(async (reply) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", reply.authorId))
          .first();

        const userId = await getAuthUserId(ctx);
        let liked = false;
        if (userId) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_userId_targetId", (q) =>
              q.eq("userId", userId).eq("targetId", reply._id)
            )
            .first();
          liked = !!like;
        }

        return { ...reply, authorProfile: profile, liked };
      })
    );
  },
});

// Add a comment or reply
export const add = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, { postId, content, parentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Complete onboarding first");

    if (!content.trim()) throw new Error("Comment cannot be empty");
    if (content.length > 1000) throw new Error("Comment too long (max 1000 chars)");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    const commentId = await ctx.db.insert("comments", {
      postId,
      authorId: userId,
      content: content.trim(),
      parentId,
      likeCount: 0,
      replyCount: 0,
      createdAt: Date.now(),
    });

    // Increment post comment count
    await ctx.db.patch(postId, { commentCount: post.commentCount + 1 });

    // Increment parent reply count
    if (parentId) {
      const parent = await ctx.db.get(parentId);
      if (parent) {
        await ctx.db.patch(parentId, { replyCount: parent.replyCount + 1 });
      }
    }

    // Notify post author (if not self-comment)
    if (post.authorId !== userId) {
      await ctx.db.insert("notifications", {
        recipientId: post.authorId,
        type: parentId ? "reply" : "comment",
        actorId: userId,
        postId,
        commentId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    // If reply, notify parent comment author
    if (parentId) {
      const parent = await ctx.db.get(parentId);
      if (parent && parent.authorId !== userId && parent.authorId !== post.authorId) {
        await ctx.db.insert("notifications", {
          recipientId: parent.authorId,
          type: "reply",
          actorId: userId,
          postId,
          commentId,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return commentId;
  },
});

// Delete a comment
export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(commentId);

    // Decrement post comment count
    const post = await ctx.db.get(comment.postId);
    if (post && post.commentCount > 0) {
      await ctx.db.patch(comment.postId, { commentCount: post.commentCount - 1 });
    }
  },
});
