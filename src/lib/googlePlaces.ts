const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface PlaceResult {
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
}

export async function searchHotels(query: string, city: string): Promise<PlaceResult[]> {
  if (!PLACES_API_KEY) return [];

  try {
    const searchQuery = city ? `${query} in ${city}` : query;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=lodging&key=${PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    return (data.results || []).map((place: any) => ({
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
      photos: (place.photos || []).slice(0, 5).map((p: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${PLACES_API_KEY}`
      ),
      types: place.types,
    }));
  } catch (error) {
    console.error('Google Places search error:', error);
    return [];
  }
}

export async function getHotelDetails(placeId: string): Promise<PlaceResult | null> {
  if (!PLACES_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,geometry,photos,url,international_phone_number&key=${PLACES_API_KEY}`;
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
    };
  } catch (error) {
    console.error('Google Places details error:', error);
    return null;
  }
}
