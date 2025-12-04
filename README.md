# Twitter Outfit Generator

A Next.js application that generates custom styled outfit images for Twitter profiles using Google Gemini AI. Users enter their Twitter handle, and the system creates a personalized outfit image while preserving their face and background.

## Features

- 🎨 **AI-Powered Image Editing** - Uses Google Gemini 2.5 Flash to edit clothing while preserving face/background
- 🐦 **Twitter Integration** - Fetches avatars via Unavatar.io (no Twitter API needed)
- 💾 **Smart Caching** - Stores generated images in Supabase to avoid regeneration
- 🎯 **Deterministic Styles** - Same user always gets the same style
- 📱 **Responsive Design** - Beautiful UI built with Tailwind CSS
- 🔗 **Social Sharing** - Share outfits on Twitter with OG image support

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Google Gemini 2.5 Flash Image Preview
- **Database:** Supabase (PostgreSQL)
- **Avatar Service:** Unavatar.io

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Supabase account ([Sign up here](https://supabase.com))

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd twitter-outfit-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_URL=http://localhost:3000
   NEXT_PUBLIC_BRAND_NAME=Your Event Name
   ```

4. **Set up Supabase database:**
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - This creates the `outfits` table with proper indexes and policies

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Customization

### 1. Customize Outfit Styles

Edit `lib/gemini-api.ts` to define your outfit styles:

```typescript
const OUTFIT_STYLES = [
  {
    name: 'YOUR_STYLE_1',
    description: `**YOUR_STYLE_1**: Your style description
- Key characteristics
- Color scheme
- Accessories
- ACCESSORIES: Specific accessories`,
  },
  // Add more styles...
];
```

### 2. Customize Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  'brand-primary': '#YOUR_COLOR',
  'brand-secondary': '#YOUR_COLOR',
  // ...
}
```

Also update `BRAND_COLORS` in `lib/gemini-api.ts` to match.

### 3. Customize Brand Name

Set `NEXT_PUBLIC_BRAND_NAME` in your `.env.local` file, or update it in the code.

### 4. Customize UI Text

Edit the components in `components/` and `app/page.tsx` to change UI text and messaging.

## Project Structure

```
twitter-outfit-generator/
├── app/
│   ├── api/
│   │   ├── generate-outfit/    # Main outfit generation endpoint
│   │   ├── resolve-identity/   # Twitter avatar fetching
│   │   └── og-image/           # Open Graph images
│   ├── outfit/[handle]/        # Shareable outfit pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page
│   └── globals.css              # Global styles
├── components/
│   ├── HandleInput.tsx         # Twitter handle input
│   ├── LoadingState.tsx        # Loading animations
│   ├── PlatformSelector.tsx    # Platform UI
│   └── ResultsDisplay.tsx       # Results display
├── lib/
│   ├── gemini-api.ts           # Gemini API client (CUSTOMIZE STYLES HERE)
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utility functions
├── supabase/
│   └── schema.sql              # Database schema
└── package.json
```

## API Routes

### `POST /api/resolve-identity`
Fetches Twitter avatar for a handle.

**Request:**
```json
{
  "handle": "elonmusk",
  "platform": "twitter"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "elonmusk",
    "displayName": "elonmusk",
    "imageUrl": "https://..."
  }
}
```

### `POST /api/generate-outfit`
Generates or retrieves cached outfit image.

**Request:**
```json
{
  "imageUrl": "https://avatar-url.com/image.jpg",
  "username": "elonmusk"
}
```

**Response:**
```json
{
  "success": true,
  "image": "base64_image_data",
  "cached": false
}
```

### `GET /api/og-image?handle=username`
Returns outfit image for Open Graph/social sharing.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- etc.

Make sure to set all environment variables in your deployment platform.

## How It Works

1. **User enters Twitter handle** → Frontend calls `/api/resolve-identity`
2. **Fetch avatar** → Uses Unavatar.io to get profile picture
3. **Check cache** → Looks for existing outfit in Supabase
4. **Generate outfit** → If not cached, sends image + prompt to Gemini API
5. **Save to cache** → Stores result in Supabase for future use
6. **Display result** → Shows generated outfit with download/share options

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_URL` | Your app URL (for OG images) | Yes |
| `NEXT_PUBLIC_BRAND_NAME` | Brand/event name | No |

## Troubleshooting

### "GEMINI_API_KEY is not configured"
- Make sure you've set the environment variable in `.env.local`
- Restart your dev server after adding env vars

### "Failed to fetch avatar"
- The Twitter account might be private or suspended
- Try a different handle
- Use the upload feature as a fallback

### "Failed to generate outfit image"
- Check your Gemini API key is valid
- Check API quota/limits
- Try again (sometimes API has temporary issues)

## License

MIT

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Google Gemini](https://ai.google.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

