import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a unique slug
function generateSlug(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Create a new anonymous question
export const create = mutation({
  args: {
    question: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Complete onboarding first");

    if (!args.question.trim()) throw new Error("Question cannot be empty");
    if (args.question.length > 280) throw new Error("Question too long (max 280 chars)");

    // Generate unique slug
    let slug = generateSlug();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await ctx.db
        .query("anonymousQuestions")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = generateSlug();
      attempts++;
    }

    const questionId = await ctx.db.insert("anonymousQuestions", {
      ownerId: userId,
      question: args.question.trim(),
      description: args.description?.trim(),
      slug,
      responseCount: 0,
      isActive: true,
      createdAt: Date.now(),
    });

    return { questionId, slug };
  },
});

// Get question by slug (public — no auth needed for viewing)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const question = await ctx.db
      .query("anonymousQuestions")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!question) return null;

    const ownerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", question.ownerId))
      .first();

    return { ...question, ownerProfile };
  },
});

// Get question by ID
export const getById = query({
  args: { questionId: v.id("anonymousQuestions") },
  handler: async (ctx, { questionId }) => {
    const question = await ctx.db.get(questionId);
    if (!question) return null;

    const ownerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", question.ownerId))
      .first();

    return { ...question, ownerProfile };
  },
});

// List questions owned by current user
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("anonymousQuestions")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .order("desc")
      .take(50);
  },
});

// Submit an anonymous response (no auth required)
export const submitResponse = mutation({
  args: {
    slug: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { slug, content }) => {
    if (!content.trim()) throw new Error("Response cannot be empty");
    if (content.length > 1000) throw new Error("Response too long (max 1000 chars)");

    const question = await ctx.db
      .query("anonymousQuestions")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!question) throw new Error("Question not found");
    if (!question.isActive) throw new Error("This question is no longer accepting responses");

    const responseId = await ctx.db.insert("anonymousResponses", {
      questionId: question._id,
      content: content.trim(),
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.patch(question._id, {
      responseCount: question.responseCount + 1,
    });

    // Notify question owner
    await ctx.db.insert("notifications", {
      recipientId: question.ownerId,
      type: "question_response",
      questionId: question._id,
      isRead: false,
      createdAt: Date.now(),
    });

    return responseId;
  },
});

// Get responses for a question (owner only)
export const listResponses = query({
  args: { questionId: v.id("anonymousQuestions") },
  handler: async (ctx, { questionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const question = await ctx.db.get(questionId);
    if (!question) throw new Error("Question not found");
    if (question.ownerId !== userId) throw new Error("Not authorized");

    return await ctx.db
      .query("anonymousResponses")
      .withIndex("by_questionId_createdAt", (q) => q.eq("questionId", questionId))
      .order("desc")
      .take(200);
  },
});

// React to a response (owner only)
export const reactToResponse = mutation({
  args: {
    responseId: v.id("anonymousResponses"),
    reaction: v.union(v.literal("love"), v.literal("laugh"), v.literal("sad"), v.literal("surprised")),
  },
  handler: async (ctx, { responseId, reaction }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const response = await ctx.db.get(responseId);
    if (!response) throw new Error("Response not found");

    const question = await ctx.db.get(response.questionId);
    if (!question || question.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(responseId, { reaction, isRead: true });
  },
});

// Toggle active status
export const toggleActive = mutation({
  args: { questionId: v.id("anonymousQuestions") },
  handler: async (ctx, { questionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const question = await ctx.db.get(questionId);
    if (!question || question.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(questionId, { isActive: !question.isActive });
  },
});

// Delete a question
export const remove = mutation({
  args: { questionId: v.id("anonymousQuestions") },
  handler: async (ctx, { questionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const question = await ctx.db.get(questionId);
    if (!question || question.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(questionId);
  },
});

// List recent public questions for explore
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db
      .query("anonymousQuestions")
      .withIndex("by_createdAt")
      .order("desc")
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(20);

    return await Promise.all(
      questions.map(async (q) => {
        const ownerProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (pq) => pq.eq("userId", q.ownerId))
          .first();
        return { ...q, ownerProfile };
      })
    );
  },
});
