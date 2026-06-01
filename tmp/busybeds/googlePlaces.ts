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

export async function searchHotels(query: string, city: string, region?: string): Promise<PlaceResult[]> {
  if (!PLACES_API_KEY) return [];

  try {
    const locationQuery = region ? `${query} hotel in ${region}, ${city}` : `${query} hotel in ${city}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(locationQuery)}&type=lodging&key=${PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    return (data.results || []).map((place: any) => {
      const photos = (place.photos || []).map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${PLACES_API_KEY}`
      );

      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
        photoUrl: photos[0] || undefined,
        photos,
        types: place.types,
      };
    });
  } catch (error) {
    console.error('Google Places search error:', error);
    return [];
  }
}

export async function getHotelDetails(placeId: string): Promise<PlaceResult | null> {
  if (!PLACES_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,geometry,photos,url,address_component&key=${PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const place = data.result;

    if (!place) return null;

    const photos = (place.photos || []).map((photo: any) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${PLACES_API_KEY}`
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
      photoUrl: photos[0] || undefined,
      photos,
    };
  } catch (error) {
    console.error('Google Places details error:', error);
    return null;
  }
}
