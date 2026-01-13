# Networkia

A modern personal network management system designed to help you manage your connections and interests without the bloat of traditional social platforms. Built with Next.js, Prisma, and Neon, free for all.

## Table of Contents

- [Introduction](#introduction)
- [Who is it for?](#who-is-it-for)
- [What Networkia Isn’t](#what-networkia-isnt)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [Principles, Vision, and Goals](#principles-vision-and-goals)
- [Learn More](#learn-more)
- [License](#license)

## Introduction

Networkia is a minimalist, awesome tool for mapping your relationship with people and interests. It not only helps you to build better relationships, it also helps you to understand yourself better. It’s the perfect tool to curate content about the people you care about, what matters to you, and how you connect the dots.

It’s not public. It’s not social. It’s just for you: A private, living snapshot of who you are and who matters to you. It’s not a Google Doc, Notion, or anything else. It’s a web app that you can open from any device on a browser and it immediately syncs.

## Who is it for?

- For people who have a vast network of people and actually want to remember details they care about — like how many kids a friend has and what causes they support
- For the forgetful an aide to take notes on what matters to them the most without turning into that Memento dude
- Enables people to become more social by remembering things about people or even about themselves. How often were you asked about your favorite country but you didn’t have an answer. 

## What Networkia Isn’t

- It’s not a social network
- It doesn’t track users
- It doesn’t include AI integrations (yet)

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **Prisma** - Type-safe ORM
- **Neon** - Serverless PostgreSQL database
- **NextAuth.js v5** - Authentication with Google OAuth

## Features

- 🔐 Google OAuth authentication
- 📊 PostgreSQL database with Prisma
- 🎨 Tailwind CSS v4 for styling
- 🔒 Type-safe database queries
- 📱 Responsive design with dark mode support

## Getting Started

To run your own instance of Networkia:

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/networkia.git
cd networkia
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Update the values in `.env.local`:

- Your **Neon** PostgreSQL database URL
- Your **Google OAuth** client ID and secret
- A secure value for `NEXTAUTH_SECRET`

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Using Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string
4. Add it to `.env.local` as `DATABASE_URL`

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create a migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to `.env.local`



## Principles, Vision, and Goals

### Principles

- Simplicity over complexity
- Respect for user data
- Clarity and transparency
- Developer-first experience
- No tracking, no ads, no nonsense

### Vision

To provide a clean, customizable starter kit that doesn’t get in your way and doesn’t demand a PhD to maintain.

### Goals

- Be easy to set up and deploy
- Support common use cases with minimal boilerplate
- Encourage best practices without being pushy
- Be flexible enough to adapt to your weird ideas

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

Copyright © 2025

Licensed under [the AGPL License](https://github.com/monicahq/monica/blob/main/LICENSE.md).

