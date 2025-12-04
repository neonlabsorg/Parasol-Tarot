import { Metadata } from 'next';
import { getCachedOutfit } from '@/lib/supabase';
import { redirect } from 'next/navigation';

type Props = {
  params: { handle: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = decodeURIComponent(params.handle);
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Parasol Tarot';
  
  // Try to get outfit from database
  const outfit = await getCachedOutfit(handle);
  
  if (outfit) {
    return {
      title: `${handle}'s Tarot Card - ${brandName}`,
      description: `Check out ${handle}'s Parasol tarot card! Discover your tarot card now.`,
      openGraph: {
        title: `${handle}'s Tarot Card - ${brandName}`,
        description: `Check out ${handle}'s Parasol tarot card! Discover your tarot card now!`,
        images: [`${appUrl}/api/og-image?handle=${encodeURIComponent(handle)}`],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${handle}'s Tarot Card - ${brandName}`,
        description: `Check out ${handle}'s Parasol tarot card! Discover your tarot card now!`,
        images: [`${appUrl}/api/og-image?handle=${encodeURIComponent(handle)}`],
      },
    };
  }

  // Default metadata if outfit not found
  return {
    title: brandName,
    description: `Discover your tarot card! Get your Parasol tarot card image!`,
  };
}

export default async function OutfitPage({ params }: Props) {
  const handle = decodeURIComponent(params.handle);
  
  // Redirect to home with handle parameter (will auto-load outfit)
  redirect(`/?handle=${encodeURIComponent(handle)}`);
}

