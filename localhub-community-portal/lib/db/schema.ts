import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Countries → Cities → Towns hierarchy
export const countries = sqliteTable('countries', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(), // ISO code
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const cities = sqliteTable('cities', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  countryId: integer('country_id').notNull().references(() => countries.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const towns = sqliteTable('towns', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  cityId: integer('city_id').notNull().references(() => cities.id),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Users with verification
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // bcrypt hash
  fullName: text('full_name').notNull(),
  bio: text('bio'),
  profilePic: text('profile_pic'), // Path to uploaded image
  townId: integer('town_id').references(() => towns.id),
  cityId: integer('city_id').references(() => cities.id),
  countryId: integer('country_id').references(() => countries.id),
  
  // Verification
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  verificationStatus: text('verification_status').notNull().default('pending'), // pending, approved, rejected
  proofOfResidence: text('proof_of_residence'), // Path to uploaded file
  identityProof: text('identity_proof'), // Path to uploaded file
  verificationNotes: text('verification_notes'), // Admin notes
  
  // Premium subscription
  isPremium: integer('is_premium', { mode: 'boolean' }).notNull().default(false),
  premiumExpiresAt: integer('premium_expires_at', { mode: 'timestamp' }),
  
  // Visibility settings
  visibleToOtherCities: integer('visible_to_other_cities', { mode: 'boolean' }).notNull().default(false),
  visibleToOtherTowns: integer('visible_to_other_towns', { mode: 'boolean' }).notNull().default(true),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Friends/Connections
export const connections = sqliteTable('connections', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // pending, accepted, blocked
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Forum Categories
export const forumCategories = sqliteTable('forum_categories', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'), // Icon name
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Forum Posts/Threads
export const forumPosts = sqliteTable('forum_posts', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown
  categoryId: integer('category_id').references(() => forumCategories.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  townId: integer('town_id').references(() => towns.id), // Post visibility scope
  cityId: integer('city_id').references(() => cities.id),
  
  // Engagement
  views: integer('views').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isLocked: integer('is_locked', { mode: 'boolean' }).notNull().default(false),
  
  // Moderation
  isFlagged: integer('is_flagged', { mode: 'boolean' }).notNull().default(false),
  flaggedReason: text('flagged_reason'),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Forum Post Images
export const forumPostImages = sqliteTable('forum_post_images', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  imagePath: text('image_path').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Forum Comments/Replies - declare first to avoid circular reference
export const forumComments = sqliteTable('forum_comments', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  parentId: integer('parent_id'), // For nested replies
  likes: integer('likes').notNull().default(0),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Post Likes
export const postLikes = sqliteTable('post_likes', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Comment Likes
export const commentLikes = sqliteTable('comment_likes', {
  id: integer('id').primaryKey(),
  commentId: integer('comment_id').notNull().references(() => forumComments.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Chat Rooms
export const chatRooms = sqliteTable('chat_rooms', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // public, private, group
  townId: integer('town_id').references(() => towns.id), // For public rooms
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Chat Room Members
export const chatRoomMembers = sqliteTable('chat_room_members', {
  id: integer('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Chat Messages
export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Marketplace Ads
export const marketplaceAds = sqliteTable('marketplace_ads', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // In cents
  category: text('category').notNull(), // Electronics, Furniture, etc.
  sellerId: integer('seller_id').notNull().references(() => users.id),
  villageId: integer('village_id').references(() => villages.id),
  cityId: integer('city_id').references(() => cities.id),
  
  // Status
  status: text('status').notNull().default('active'), // active, sold, expired
  isPremium: integer('is_premium', { mode: 'boolean' }).notNull().default(false), // Highlighted
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Marketplace Ad Images
export const marketplaceAdImages = sqliteTable('marketplace_ad_images', {
  id: integer('id').primaryKey(),
  adId: integer('ad_id').notNull().references(() => marketplaceAds.id, { onDelete: 'cascade' }),
  imagePath: text('image_path').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Services Listings
export const services = sqliteTable('services', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // Handyman, Tutoring, etc.
  providerId: integer('provider_id').notNull().references(() => users.id),
  villageId: integer('village_id').references(() => villages.id),
  cityId: integer('city_id').references(() => cities.id),
  
  // Pricing
  rateType: text('rate_type').notNull(), // hourly, fixed, negotiable
  rateAmount: integer('rate_amount'), // In cents, if fixed
  
  // Availability
  availability: text('availability'), // JSON string with schedule
  
  // Status
  status: text('status').notNull().default('active'), // active, inactive
  isPremium: integer('is_premium', { mode: 'boolean' }).notNull().default(false),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Service Reviews
export const serviceReviews = sqliteTable('service_reviews', {
  id: integer('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Service Images
export const serviceImages = sqliteTable('service_images', {
  id: integer('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  imagePath: text('image_path').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// FTS5 Virtual Table for Search (SQLite full-text search)
export const forumPostsFTS = sqliteTable('forum_posts_fts', {
  rowid: integer('rowid').primaryKey(),
  title: text('title'),
  content: text('content'),
});

