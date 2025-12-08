# Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google Gemini API Key
# Get yours at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Override Gemini model (default: gemini-2.5-flash-image-preview)
# NOTE: The default model may require billing enabled. Free tier has quota restrictions.
# GEMINI_MODEL=gemini-2.5-flash-image-preview

# Supabase Configuration
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key_here

# App URL (for OG images and sharing)
# Use your production URL when deployed
NEXT_PUBLIC_URL=http://localhost:3000

# Brand/Event Name (optional - used in prompts and UI)
NEXT_PUBLIC_BRAND_NAME=Your Event Name
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Go to [supabase.com](https://supabase.com) and create a project
   - In the SQL Editor, run the SQL from `supabase/schema.sql`
   - Copy your project URL and publishable/default key to `.env.local`

3. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to `.env.local`
   - **Important:** The `gemini-2.5-flash-image-preview` model may require billing enabled in Google Cloud Console. 
     Free tier has limited quota (often 0 requests). If you encounter quota errors:
     - Enable billing in [Google Cloud Console](https://console.cloud.google.com/)
     - Or wait for quota to reset (check rate limit message for retry time)
     - Or try a different model by setting `GEMINI_MODEL` in `.env.local`

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Customization Checklist

- [ ] Update outfit styles in `lib/gemini-api.ts`
- [ ] Update brand colors in `tailwind.config.ts`
- [ ] Update brand colors in `lib/gemini-api.ts` (BRAND_COLORS)
- [ ] Set `NEXT_PUBLIC_BRAND_NAME` in `.env.local`
- [ ] Update UI text in `app/page.tsx` and components
- [ ] Update metadata in `app/layout.tsx`

