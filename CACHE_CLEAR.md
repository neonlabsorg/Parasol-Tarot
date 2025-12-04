# How to Clear Cache and Regenerate Images

## Method 1: Use the Regenerate Button (Easiest)

After generating a fighter image, you'll see a **"🔄 Regenerate Fighter"** button below the image. Click it to force a new generation that bypasses the cache.

## Method 2: Clear Cache from Supabase Database

If you want to completely clear the cache for a specific handle or all handles:

### Option A: Clear a Specific Handle

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **outfits** table
3. Find the row with the handle you want to clear
4. Delete that row

### Option B: Clear All Cache

Run this SQL in the Supabase SQL Editor:

```sql
-- Clear all cached outfits
DELETE FROM outfits;
```

### Option C: Clear Cache for a Specific Handle via SQL

```sql
-- Replace 'username' with the actual handle
DELETE FROM outfits WHERE handle = LOWER('username');
```

## Method 3: Force Regenerate via API

You can also force regeneration by calling the API directly with `forceRegenerate: true`:

```javascript
fetch('/api/generate-outfit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    imageUrl: 'https://example.com/avatar.jpg',
    username: 'handle',
    forceRegenerate: true  // This bypasses cache
  }),
});
```

## Notes

- The cache is stored in the Supabase `outfits` table
- Each handle gets one cached entry
- Regenerating will create a new image (may vary due to AI generation)
- The same handle will always get the same fighter style (deterministic based on username hash)

