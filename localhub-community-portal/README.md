# LocalHub Community Portal

A hyper-local community portal that fosters real-world connections in small geographic areas. Built with Next.js, SQLite, and Socket.io - entirely free and open-source.

## Features

- ✅ **Verified Identities**: Admin-approved user verification with proof of residence
- ✅ **Hierarchical Communities**: Village → City → Country structure with isolation
- ✅ **Discussion Forums**: Categories, threads, nested comments, Markdown support
- ✅ **Real-Time Chat**: WebSocket-based chat rooms (public, private, themed)
- ✅ **Marketplace**: Buy/sell ads with search and filtering
- ✅ **Services Portal**: Service listings with reviews and ratings
- ✅ **Admin Dashboard**: User approval, content moderation, community management
- ✅ **Privacy-First**: All data stored server-side, no external dependencies

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Express (for Socket.io)
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT with bcrypt
- **Real-Time**: Socket.io
- **File Uploads**: Multer
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- SQLite (included via better-sqlite3)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Set JWT_SECRET, ADMIN_EMAIL, etc.

# Generate database schema
npm run db:generate

# Run migrations (creates database)
npm run db:migrate

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000

## Environment Variables

See `.env.example` for all required variables:

- `JWT_SECRET`: Secret key for JWT tokens
- `ADMIN_EMAIL`: Email for first admin user
- `DATABASE_PATH`: Path to SQLite database file
- `SMTP_*`: Optional email configuration
- `NEXT_PUBLIC_ADSENSE_*`: Optional Google AdSense

## Database Management

```bash
# Generate migrations from schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed sample data
npm run db:seed
```

## Project Structure

```
localhub-community-portal/
├── pages/
│   ├── api/           # API routes
│   ├── admin/         # Admin pages
│   ├── chat/          # Chat pages
│   ├── forums/        # Forum pages
│   ├── marketplace/  # Marketplace pages
│   └── services/     # Services pages
├── components/        # React components
├── lib/
│   ├── db/           # Database setup & schema
│   ├── auth/         # Authentication utilities
│   └── utils/        # Helper functions
├── public/           # Static files & uploads
├── scripts/          # Seed scripts
└── types/            # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Note**: SQLite on Vercel requires special handling. For production, consider:
- Railway (free tier with persistent storage)
- Self-hosting on a VPS
- Using a free PostgreSQL alternative

### Self-Hosting

```bash
npm run build
npm start
```

## Key Features Explained

### User Verification

1. User signs up with email, name, location
2. Uploads proof of residence (ID/utility bill)
3. Admin reviews in admin dashboard
4. Approved users get "Verified Resident" badge

### Community Isolation

- Users belong to a Village (neighborhood)
- Villages belong to a City
- Cities belong to a Country
- By default, users only see content from their village
- Can opt-in to see neighboring villages/cities

### Real-Time Chat

- WebSocket-based using Socket.io
- Public rooms (Village Square)
- Private 1:1 and group chats
- Message history persisted in database

## Security

- JWT authentication
- Password hashing with bcrypt
- Input sanitization (XSS protection)
- Rate limiting on API routes
- File upload validation
- Admin-only routes protected

## Contributing

This is a community project. Contributions welcome!

## License

MIT License - Free and open-source

## Support

For issues or questions, please open an issue on GitHub.

