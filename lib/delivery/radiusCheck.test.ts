import { describe, it, expect } from 'vitest';
import { isWithinDeliveryRadius, calculateDistance, COVE_COORDINATES } from './radiusCheck';

describe('Delivery Radius Logic Tests', () => {
  it('should calculate distance correctly between coordinates', () => {
    // Distance from COVE to itself should be 0
    const distanceToSelf = calculateDistance(
      COVE_COORDINATES.lat,
      COVE_COORDINATES.lng,
      COVE_COORDINATES.lat,
      COVE_COORDINATES.lng
    );
    expect(distanceToSelf).toBe(0);

    // Distance from COVE to Zarkawt (approx 0.5km)
    const distanceToZarkawt = calculateDistance(
      COVE_COORDINATES.lat,
      COVE_COORDINATES.lng,
      23.7315,
      92.7172
    );
    expect(distanceToZarkawt).toBeLessThan(0.6);
  });

  it('should validate close-by Aizawl neighborhoods as within radius (isValid: true)', () => {
    const chanmari = isWithinDeliveryRadius('chanmari');
    expect(chanmari.isValid).toBe(true);
    expect(chanmari.distanceKm).toBeLessThan(1.0);

    const dawrpui = isWithinDeliveryRadius('dawrpui');
    expect(dawrpui.isValid).toBe(true);
    expect(dawrpui.distanceKm).toBeLessThan(1.0);

    const zarkawt = isWithinDeliveryRadius('zarkawt');
    expect(zarkawt.isValid).toBe(true);
    expect(zarkawt.distanceKm).toBeLessThan(0.6);
  });

  it('should validate mid-distance neighborhoods as within radius', () => {
    const ramhlun = isWithinDeliveryRadius('ramhlun');
    expect(ramhlun.isValid).toBe(true);
    expect(ramhlun.distanceKm).toBeCloseTo(1.6, 1);

    const bawngkawn = isWithinDeliveryRadius('bawngkawn');
    expect(bawngkawn.isValid).toBe(true);
    expect(bawngkawn.distanceKm).toBeCloseTo(3.0, 1);

    const khatla = isWithinDeliveryRadius('khatla');
    expect(khatla.isValid).toBe(true);
    expect(khatla.distanceKm).toBeCloseTo(2.5, 1);
  });

  it('should validate far-away neighborhoods as outside radius (isValid: false)', () => {
    const melthum = isWithinDeliveryRadius('melthum');
    expect(melthum.isValid).toBe(false);
    expect(melthum.distanceKm).toBeCloseTo(6.2, 1);

    const sihphir = isWithinDeliveryRadius('sihphir');
    expect(sihphir.isValid).toBe(false);
    expect(sihphir.distanceKm).toBeCloseTo(8.6, 1);
  });

  it('should return invalid status and Infinity for an unmapped neighborhood ID', () => {
    const result = isWithinDeliveryRadius('nonexistent_place');
    expect(result.isValid).toBe(false);
    expect(result.distanceKm).toBe(Infinity);
  });
});
