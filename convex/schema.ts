import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Anonymous public profiles (what others see)
  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    bio: v.optional(v.string()),
    avatarSeed: v.string(),       // seed for deterministic avatar gradient
    avatarEmoji: v.optional(v.string()),
    karma: v.number(),
    postCount: v.number(),
    isVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_username", ["username"])
    .searchIndex("search_username", { searchField: "username" }),

  // Posts (feed posts + confessions)
  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("post"), v.literal("confession")),
    category: v.optional(v.string()),   // for confessions: campus | relationships | friendships | academics | hot_takes | secrets
    tags: v.optional(v.array(v.string())),
    likeCount: v.number(),
    commentCount: v.number(),
    isPinned: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_authorId", ["authorId"])
    .index("by_type", ["type"])
    .index("by_type_createdAt", ["type", "createdAt"])
    .index("by_category", ["category"])
    .searchIndex("search_content", { searchField: "content", filterFields: ["type", "category"] }),

  // Comments (supports nesting via parentId)
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    likeCount: v.number(),
    replyCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_postId_createdAt", ["postId", "createdAt"])
    .index("by_parentId", ["parentId"])
    .index("by_authorId", ["authorId"]),

  // Likes (polymorphic: post or comment)
  likes: defineTable({
    userId: v.id("users"),
    targetId: v.string(),           // stringified post or comment id
    targetType: v.union(v.literal("post"), v.literal("comment")),
    createdAt: v.number(),
  })
    .index("by_userId_targetId", ["userId", "targetId"])
    .index("by_targetId", ["targetId"]),

  // Notifications
  notifications: defineTable({
    recipientId: v.id("users"),
    type: v.union(
      v.literal("like_post"),
      v.literal("like_comment"),
      v.literal("comment"),
      v.literal("reply"),
      v.literal("question_response"),
      v.literal("follow")
    ),
    actorId: v.optional(v.id("users")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    questionId: v.optional(v.id("anonymousQuestions")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipientId", ["recipientId"])
    .index("by_recipientId_isRead", ["recipientId", "isRead"])
    .index("by_recipientId_createdAt", ["recipientId", "createdAt"]),

  // Anonymous question prompts
  anonymousQuestions: defineTable({
    ownerId: v.id("users"),
    question: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    responseCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_createdAt", ["createdAt"]),

  // Anonymous responses to questions (no auth required to submit)
  anonymousResponses: defineTable({
    questionId: v.id("anonymousQuestions"),
    content: v.string(),
    isRead: v.boolean(),
    reaction: v.optional(v.string()),   // owner can react: love | laugh | sad | surprised
    createdAt: v.number(),
  })
    .index("by_questionId", ["questionId"])
    .index("by_questionId_createdAt", ["questionId", "createdAt"]),
});
