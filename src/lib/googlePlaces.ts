const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  photos?: string[];
  types?: string[];
  userRatingsTotal?: number;
  icon?: string;
}

/**
 * Search Google Places with pagination support (up to 60 results = 3 pages of 20)
 */
export async function searchHotels(query: string, city: string, maxResults: number = 60): Promise<PlaceResult[]> {
  if (!PLACES_API_KEY) return [];

  try {
    const searchQuery = city ? `${query} in ${city}` : query;
    const allResults: any[] = [];
    let nextPageToken: string | undefined = undefined;
    let pagesFetched = 0;
    const maxPages = 3; // Google allows max 3 pages (20 each = 60 total)

    do {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=lodging&key=${PLACES_API_KEY}`;
      if (nextPageToken) {
        url += `&pagetoken=${nextPageToken}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.results) {
        allResults.push(...data.results);
      }

      nextPageToken = data.next_page_token;
      pagesFetched++;

      // Google requires a short delay before using next_page_token
      if (nextPageToken && pagesFetched < maxPages && allResults.length < maxResults) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (nextPageToken && pagesFetched < maxPages && allResults.length < maxResults);

    // Trim to maxResults
    const trimmed = allResults.slice(0, maxResults);

    return trimmed.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      rating: place.rating,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      photoUrl: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${PLACES_API_KEY}`
        : undefined,
      photos: (place.photos || []).slice(0, 10).map((p: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${PLACES_API_KEY}`
      ),
      types: place.types,
      userRatingsTotal: place.user_ratings_total,
      icon: place.icon,
    }));
  } catch (error) {
    console.error('Google Places search error:', error);
    return [];
  }
}

/**
 * Get detailed info about a specific place
 */
export async function getHotelDetails(placeId: string): Promise<PlaceResult | null> {
  if (!PLACES_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,geometry,photos,url,types&key=${PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const place = data.result;

    if (!place) return null;

    const allPhotos = (place.photos || []).slice(0, 10).map((p: any) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${PLACES_API_KEY}`
    );

    return {
      placeId,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || place.international_phone_number,
      website: place.website,
      rating: place.rating,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      photoUrl: allPhotos[0] || undefined,
      photos: allPhotos,
      types: place.types,
      userRatingsTotal: place.user_ratings_total,
    };
  } catch (error) {
    console.error('Google Places details error:', error);
    return null;
  }
}

/**
 * Resolve a Google Places photo URL to the actual image URL (follows 302 redirect)
 */
export async function resolvePhotoUrl(photoReference: string, maxWidth: number = 800): Promise<string | null> {
  if (!PLACES_API_KEY) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${PLACES_API_KEY}`;
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status === 302) {
      return res.headers.get('location') || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Auto-detect region from address/city/country
 */
export function detectRegion(address: string, city: string, country: string): string {
  const REGIONS: Record<string, string[]> = {
    'East Africa': ['Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi', 'Ethiopia', 'Zanzibar'],
    'West Africa': ['Ghana', 'Nigeria'],
    'Southern Africa': ['South Africa'],
  };

  for (const [region, countries] of Object.entries(REGIONS)) {
    if (countries.some(c => country.toLowerCase().includes(c.toLowerCase()))) {
      return region;
    }
  }

  // Check common East African cities
  const eastAfricanCities = ['dar es salaam', 'arusha', 'zanzibar', 'nairobi', 'mombasa', 'kampala', 'kigali', 'addis ababa', 'dodoma', 'mwanza', 'stone town', 'nungwi', 'kendwa', 'paje', 'diani', 'kisumu', 'nakuru', 'entebbe', 'jinja', 'bujumbura', 'lalibela', 'bahir dar'];
  const cityLower = city.toLowerCase();
  if (eastAfricanCities.some(c => cityLower.includes(c))) {
    return 'East Africa';
  }

  return country || 'Unknown';
}
