import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the currently authenticated user with their profile
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    return { user, profile };
  },
});

// Get profile by username (public)
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (!profile) return null;
    const user = await ctx.db.get(profile.userId);
    return { profile, user };
  },
});

// Get profile by userId (internal use)
export const getProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Check if username is available
export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    return { available: !existing };
  },
});

// Create profile (onboarding)
export const createProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    avatarEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check username taken
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existing) throw new Error("Username already taken");

    // Check not already has profile
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existingProfile) throw new Error("Profile already exists");

    // Generate random seed for avatar
    const avatarSeed = Math.random().toString(36).substring(2, 10);

    const profileId = await ctx.db.insert("profiles", {
      userId,
      username: args.username.toLowerCase().trim(),
      bio: args.bio,
      avatarSeed,
      avatarEmoji: args.avatarEmoji,
      karma: 0,
      postCount: 0,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

// Update profile
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Profile not found");

    if (args.username && args.username !== profile.username) {
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .first();
      if (existing) throw new Error("Username already taken");
    }

    const updates: Partial<typeof profile> = { updatedAt: Date.now() };
    if (args.username !== undefined) updates.username = args.username.toLowerCase().trim();
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.avatarEmoji !== undefined) updates.avatarEmoji = args.avatarEmoji;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});

// Get multiple profiles by userId array (for bulk loading)
export const getProfilesByUserIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, { userIds }) => {
    const profiles = await Promise.all(
      userIds.map((uid) =>
        ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", uid)).first()
      )
    );
    return profiles.filter(Boolean);
  },
});

// Search users by username
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    if (query.length < 2) return [];
    return await ctx.db
      .query("profiles")
      .withSearchIndex("search_username", (q) => q.search("username", query))
      .take(10);
  },
});
