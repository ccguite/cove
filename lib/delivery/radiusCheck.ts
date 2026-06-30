/**
 * Hardcoded Aizawl neighborhood coordinates dictionary.
 */
export const NEIGHBORHOODS: Record<string, { name: string; lat: number; lng: number }> = {
  chanmari: { name: 'Chanmari', lat: 23.7360, lng: 92.7176 },
  dawrpui: { name: 'Dawrpui', lat: 23.7290, lng: 92.7170 },
  zarkawt: { name: 'Zarkawt', lat: 23.7315, lng: 92.7172 },
  ramhlun: { name: 'Ramhlun', lat: 23.7485, lng: 92.7240 },
  bawngkawn: { name: 'Bawngkawn', lat: 23.7610, lng: 92.7275 },
  khatla: { name: 'Khatla', lat: 23.7125, lng: 92.7145 },
  maubawk: { name: 'Maubawk', lat: 23.7010, lng: 92.7050 },
  melthum: { name: 'Melthum', lat: 23.6820, lng: 92.7010 },
  sihphir: { name: 'Sihphir', lat: 23.8100, lng: 92.7400 },
};

// COVE location: Chhinga Veng, Aizawl, Mizoram
export const COVE_COORDINATES = { lat: 23.7342, lng: 92.7214 };
export const MAX_DELIVERY_RADIUS_KM = 5.0;

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Validates if a neighborhood falls within the delivery boundary.
 */
export function isWithinDeliveryRadius(neighborhoodId: string): {
  isValid: boolean;
  distanceKm: number;
} {
  const target = NEIGHBORHOODS[neighborhoodId];
  if (!target) {
    return { isValid: false, distanceKm: Infinity };
  }

  const distance = calculateDistance(
    COVE_COORDINATES.lat,
    COVE_COORDINATES.lng,
    target.lat,
    target.lng
  );

  return {
    isValid: distance <= MAX_DELIVERY_RADIUS_KM,
    distanceKm: parseFloat(distance.toFixed(2))
  };
}
