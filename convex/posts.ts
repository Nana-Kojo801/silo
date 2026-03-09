import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const POST_PAGE_SIZE = 20;

// Get feed posts (paginated)
export const listFeed = query({
  args: {
    cursor: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { cursor, category }) => {
    let q = ctx.db
      .query("posts")
      .withIndex("by_type_createdAt", (q) => q.eq("type", "post"))
      .order("desc");

    const results = await q.paginate({ cursor: cursor ?? null, numItems: POST_PAGE_SIZE });

    // Hydrate with author profiles
    const postsWithProfiles = await Promise.all(
      results.page.map(async (post) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
          .first();
        return { ...post, authorProfile: profile };
      })
    );

    return {
      posts: postsWithProfiles,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

// Get trending posts (most liked in last 24h)
export const listTrending = query({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_type", (q) => q.eq("type", "post"))
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .order("desc")
      .take(50);

    // Sort by like count
    const sorted = posts.sort((a, b) => b.likeCount - a.likeCount).slice(0, 10);

    return await Promise.all(
      sorted.map(async (post) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
          .first();
        return { ...post, authorProfile: profile };
      })
    );
  },
});

// Get single post with author profile
export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
      .first();

    // Check if current user liked it
    const userId = await getAuthUserId(ctx);
    let liked = false;
    if (userId) {
      const like = await ctx.db
        .query("likes")
        .withIndex("by_userId_targetId", (q) =>
          q.eq("userId", userId).eq("targetId", postId)
        )
        .first();
      liked = !!like;
    }

    return { ...post, authorProfile: profile, liked };
  },
});

// Create a post
export const createPost = mutation({
  args: {
    content: v.string(),
    type: v.union(v.literal("post"), v.literal("confession")),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Profile not found — complete onboarding first");

    if (!args.content.trim()) throw new Error("Content cannot be empty");
    if (args.content.length > 2000) throw new Error("Content too long (max 2000 chars)");

    const postId = await ctx.db.insert("posts", {
      authorId: userId,
      content: args.content.trim(),
      type: args.type,
      category: args.category,
      tags: args.tags ?? [],
      likeCount: 0,
      commentCount: 0,
      createdAt: Date.now(),
    });

    // Increment profile post count
    await ctx.db.patch(profile._id, { postCount: (profile.postCount ?? 0) + 1 });

    return postId;
  },
});

// Edit a post
export const editPost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, { postId, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(postId, { content: content.trim(), updatedAt: Date.now() });
  },
});

// Delete a post
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(postId);

    // Decrement profile post count
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (profile && profile.postCount > 0) {
      await ctx.db.patch(profile._id, { postCount: profile.postCount - 1 });
    }
  },
});

// Get posts by a specific user
export const getByAuthor = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .order("desc")
      .take(50);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return posts.map((p) => ({ ...p, authorProfile: profile }));
  },
});

// Search posts
export const searchPosts = query({
  args: { query: v.string(), type: v.optional(v.string()) },
  handler: async (ctx, { query, type }) => {
    if (query.length < 2) return [];
    const results = await ctx.db
      .query("posts")
      .withSearchIndex("search_content", (q) => {
        let s = q.search("content", query);
        if (type) s = s.eq("type", type as "post" | "confession");
        return s;
      })
      .take(20);

    return await Promise.all(
      results.map(async (post) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
          .first();
        return { ...post, authorProfile: profile };
      })
    );
  },
});
