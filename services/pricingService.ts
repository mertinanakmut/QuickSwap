
import { BoostTier, CalculatedFee, ListingType } from "../types";

const BOOST_TIERS: BoostTier[] = [
  { id: 't1', name: 'Micro', minPriceUSD: 0, maxPriceUSD: 15, percent: 10, minUSD: 1, maxUSD: 2, durationDays: 3, features: ['Basic badge'] },
  { id: 't2', name: 'Essential', minPriceUSD: 16, maxPriceUSD: 50, percent: 8, minUSD: 2, maxUSD: 4, durationDays: 5, features: ['Search priority'] },
  { id: 't3', name: 'Popular', minPriceUSD: 51, maxPriceUSD: 250, percent: 6, minUSD: 4, maxUSD: 15, durationDays: 7, features: ['Search priority', 'Home grid'] },
  { id: 't4', name: 'Pro', minPriceUSD: 251, maxPriceUSD: 1000, percent: 4, minUSD: 15, maxUSD: 40, durationDays: 14, features: ['Home grid', 'Social share'] },
  { id: 't5', name: 'Elite', minPriceUSD: 1001, maxPriceUSD: Infinity, percent: 2, minUSD: 40, maxUSD: null, durationDays: 30, features: ['Social share', 'Top spot'] },
];

let cachedRate: number | null = null;
let cacheTime: number = 0;

export async function getExchangeRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate && (now - cacheTime < 3600000)) { // 1 hour cache
    return cachedRate;
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    cachedRate = data.rates.TRY;
    cacheTime = now;
    return cachedRate!;
  } catch (error) {
    console.error("Forex API error:", error);
    return cachedRate || 34.5; // Fallback
  }
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

function applyPsychologicalRounding(tryAmount: number): number {
  if (tryAmount < 50) return roundToNearest(tryAmount, 1);
  if (tryAmount < 200) return roundToNearest(tryAmount, 5);
  if (tryAmount < 500) return roundToNearest(tryAmount, 10);
  if (tryAmount < 1000) return roundToNearest(tryAmount, 25);
  return roundToNearest(tryAmount, 50);
}

export function calculateBoostFee(priceTRY: number, rate: number, category: string, type: ListingType): CalculatedFee {
  const priceUSD = priceTRY / rate;
  const tier = BOOST_TIERS.find(t => priceUSD >= t.minPriceUSD && priceUSD <= t.maxPriceUSD) || BOOST_TIERS[0];
  
  let feeUSD = priceUSD * (tier.percent / 100);
  
  feeUSD = Math.max(feeUSD, tier.minUSD);
  if (tier.maxUSD) feeUSD = Math.min(feeUSD, tier.maxUSD);

  // High Value Item Markup (+15%)
  const isLuxury = priceUSD > 1500;
  if (isLuxury) feeUSD *= 1.15;

  // Emergency Discount (-20%)
  const isEmergency = type === ListingType.EMERGENCY;
  if (isEmergency) feeUSD *= 0.8;

  let feeTRY = feeUSD * rate;
  feeTRY = applyPsychologicalRounding(feeTRY);

  return {
    feeTRY,
    feeUSD,
    tier,
    exchangeRate: rate,
    isLuxury,
    isEmergency
  };
}
