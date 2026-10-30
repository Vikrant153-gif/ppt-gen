/**
 * Unsplash Image Service
 * Fetches high-res landscape photos for slide backgrounds.
 * Includes fallback for empty results or rate limiting.
 */

const UNSPLASH_BASE = 'https://api.unsplash.com';

/**
 * Fetches a landscape image from Unsplash for the given query.
 * Returns { url, alt, photographerName, photographerUrl } or a fallback.
 */
async function fetchSlideImage(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return getFallbackImage(query);
  }

  try {
    const url = `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!res.ok) {
      console.warn(`[Unsplash] API returned ${res.status} for "${query}" — using fallback`);
      return getFallbackImage(query);
    }

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      // Try a broader fallback keyword
      const broader = query.split(' ').slice(0, 2).join(' ');
      if (broader !== query) {
        console.log(`[Unsplash] No results for "${query}", retrying with "${broader}"`);
        return fetchSlideImage(broader);
      }
      return getFallbackImage(query);
    }

    const photo = data.results[0];
    return {
      url: photo.urls?.regular || photo.urls?.small || '',
      alt: photo.alt_description || query,
      photographerName: photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
    };
  } catch (err) {
    console.error(`[Unsplash] Fetch error for "${query}":`, err.message);
    return getFallbackImage(query);
  }
}

/**
 * Returns a curated placeholder when Unsplash is unavailable.
 */
function getFallbackImage(query) {
  // Deterministic color based on query string
  const colors = ['1a1a2e', '16213e', '0f3460', '533483', '2c3e50', '1b4332', '3c1642', '0b0c10'];
  const idx = Math.abs([...query].reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;
  return {
    url: `https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1280&h=720&fit=crop`,
    alt: query,
    photographerName: '',
    photographerUrl: '',
    isFallback: true,
  };
}

/**
 * Fetches images for all slides concurrently using Promise.all.
 * Each slide should have an `unsplashQuery` field from Gemini.
 * Attaches image data directly onto each slide object.
 */
async function attachImagesToSlides(slides) {
  const hasKey = !!process.env.UNSPLASH_ACCESS_KEY;
  if (!hasKey) {
    console.log('[Unsplash] No UNSPLASH_ACCESS_KEY — skipping image fetch');
    return slides;
  }

  console.log(`[Unsplash] Fetching images for ${slides.length} slides...`);

  const imagePromises = slides.map((slide) => {
    const query = slide.unsplashQuery || slide.title || 'abstract background';
    return fetchSlideImage(query);
  });

  const images = await Promise.all(imagePromises);

  const enrichedSlides = slides.map((slide, i) => ({
    ...slide,
    image: images[i],
  }));

  const fetched = images.filter(img => !img.isFallback).length;
  console.log(`[Unsplash] ${fetched}/${slides.length} images fetched from Unsplash`);

  return enrichedSlides;
}

module.exports = { fetchSlideImage, attachImagesToSlides };
