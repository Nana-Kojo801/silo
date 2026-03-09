import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

const CATEGORIES = ["campus", "relationships", "friendships", "academics", "hot_takes", "secrets"] as const;

// List confessions with optional category filter
export const list = query({
  args: {
    category: v.optional(v.string()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { category, cursor }) => {
    let q = ctx.db
      .query("posts")
      .withIndex("by_type_createdAt", (q) => q.eq("type", "confession"))
      .order("desc");

    const results = await q.paginate({ cursor: cursor ?? null, numItems: 20 });

    let page = results.page;
    if (category) {
      page = page.filter((p) => p.category === category);
    }

    const postsWithProfiles = await Promise.all(
      page.map(async (post) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
          .first();
        return { ...post, authorProfile: profile };
      })
    );

    return {
      confessions: postsWithProfiles,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

// Trending confessions
export const trending = query({
  args: {},
  handler: async (ctx) => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const confessions = await ctx.db
      .query("posts")
      .withIndex("by_type", (q) => q.eq("type", "confession"))
      .filter((q) => q.gte(q.field("createdAt"), threeDaysAgo))
      .order("desc")
      .take(50);

    const sorted = confessions.sort((a, b) => b.likeCount - a.likeCount).slice(0, 8);

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

export const CONFESSION_CATEGORIES = CATEGORIES;
