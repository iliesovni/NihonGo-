import { useState, useEffect, useMemo, useCallback } from "react";
import data from "../data/data.json";
import images from "../assets/images";

export interface Place {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  cityId: number;
  regionId: number;
  typeId: number;
  tags: number[];
  image: string;
  popularity: number;
  price?: number;
  duration?: string;
  hours?: string;
}

export interface City { id: number; name: string; regionId: number; }
export interface Region { id: number; name: string; }
export interface PlaceType { id: number; name: string; }
export interface Tag { id: number; name: string; }

export interface Dataset {
  places: Place[];
  cities: City[];
  regions: Region[];
  types: PlaceType[];
  tags: Tag[];
}

const raw = data as any;

const dataset: Dataset = {
  places: (raw.lieux || raw.places || []).map((l: any) => ({
    id: Number(l.id),
    name: l.nom ?? l.name ?? "",
    shortDescription: l.description_courte ?? l.shortDescription ?? "",
    description: l.description ?? l.fullDescription ?? "",
    cityId: Number(l.ville_id ?? l.city_id ?? l.cityId ?? 0),
    regionId: Number(
      l.region_id ?? l.regionId ?? (
        (raw.villes || []).find((v: any) => Number(v.id) === Number(l.ville_id ?? l.city_id ?? l.cityId ?? 0))?.region_id
      ) ?? 0
    ),
    typeId: Number(l.type_id ?? l.typeId ?? 0),
    tags: Array.isArray(l.tag_ids ?? l.tags) ? (l.tag_ids ?? l.tags).map((t: any) => Number(t)) : [],
    image: (() => {
      const img = l.image_url ?? l.image ?? "";
      if (typeof img === 'string' && img.startsWith('img/')) {
        const bundled = images[img] || images[img.replace(/^img\//, '')];
        if (bundled) return bundled;
        return '/' + img.replace(/^img\//, 'assets/');
      }
      return img;
    })(),
    price: Number(l.prix ?? l.price ?? 0),
    duration: l.duree ?? l.duration ?? "",
    hours: l.horaires ?? l.hours ?? "",
    popularity: Number(l.popularite ?? l.popularity ?? 0),
  })),
  cities: (raw.villes || raw.cities || []).map((c: any) => ({
    id: Number(c.id),
    name: c.nom ?? c.name ?? "",
    regionId: Number(c.region_id ?? c.regionId ?? 0),
  })),
  regions: (raw.regions || raw.regions || []).map((r: any) => ({
    id: Number(r.id),
    name: r.nom ?? r.name ?? "",
  })),
  types: (raw.types || raw.types || []).map((t: any) => ({
    id: Number(t.id),
    name: t.nom ?? t.name ?? "",
  })),
  tags: (raw.tags || raw.tags || []).map((t: any) => ({
    id: Number(t.id),
    name: t.nom ?? t.name ?? "",
  })),
};

export function usePopularPlaces(limit = 6) {
  return useMemo(() => {
    return [...dataset.places]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }, [limit]);
}

interface SearchFilters {
  region: number | "";
  city: number | "";
  type: number | "";
  tag: number | "";
  price: string | "";
}

type SortOption = "popularity_desc" | "alphabetical_asc" | "alphabetical_desc" | "price_asc" | "price_desc";

export interface PlaceWithScore extends Place {
  matchScore?: number;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}


function calculateSimilarity(query: string, text: string): number {
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase().trim();


  if (textLower === queryLower) return 100;


  if (textLower.startsWith(queryLower)) return 95;


  if (textLower.includes(queryLower)) return 85;


  const queryWords = queryLower.split(/\s+/);
  const textWords = textLower.split(/\s+/);
  
  let bestMatch = 0;
  

  for (const qWord of queryWords) {
    for (const tWord of textWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        bestMatch = Math.max(bestMatch, 80);
      } else {
        const distance = levenshteinDistance(qWord, tWord);
        const maxLen = Math.max(qWord.length, tWord.length);
        if (maxLen > 0) {
          const similarity = (1 - distance / maxLen) * 100;
          bestMatch = Math.max(bestMatch, similarity);
        }
      }
    }
  }


  const globalDistance = levenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(queryLower.length, textLower.length);
  const globalSimilarity = maxLength > 0 ? (1 - globalDistance / maxLength) * 100 : 0;


  return Math.max(bestMatch, globalSimilarity);
}


function calculatePlaceMatchScore(query: string, place: Place): number {
  const queryLower = query.toLowerCase().trim();
  

  const nameScore = calculateSimilarity(queryLower, place.name) * 0.5;
  const shortDescScore = calculateSimilarity(queryLower, place.shortDescription) * 0.3;
  const descScore = calculateSimilarity(queryLower, place.description) * 0.2;

  return nameScore + shortDescScore + descScore;
}

export function useSearchPlaces() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    region: "",
    city: "",
    type: "",
    tag: "",
    price: "",
  });
  const [sortBy, setSortBy] = useState<SortOption>("popularity_desc");

  const results = useMemo(() => {
    let items: PlaceWithScore[] = [...dataset.places];

    if (filters.region) items = items.filter((p) => p.regionId === Number(filters.region));
    if (filters.city) items = items.filter((p) => p.cityId === Number(filters.city));
    if (filters.type) items = items.filter((p) => p.typeId === Number(filters.type));
    if (filters.tag) items = items.filter((p) => p.tags.includes(Number(filters.tag)));
    if (filters.price) {
      switch (filters.price) {
        case 'free':
          items = items.filter((p) => Number(p.price ?? 0) === 0);
          break;
        case 'low':
          items = items.filter((p) => Number(p.price ?? 0) > 0 && Number(p.price ?? 0) <= 500);
          break;
        case 'mid':
          items = items.filter((p) => Number(p.price ?? 0) > 500 && Number(p.price ?? 0) <= 1500);
          break;
        case 'high':
          items = items.filter((p) => Number(p.price ?? 0) > 1500);
          break;
      }
    }

    if (query.trim()) {
      items = items.map((place) => ({
        ...place,
        matchScore: calculatePlaceMatchScore(query, place)
      }));

      items = items.filter((p) => (p.matchScore ?? 0) >= 30);
    } else {

      items = items.map((place) => ({ ...place, matchScore: undefined }));
    }

    if (query.trim()) {

      items.sort((a, b) => {
        const scoreA = a.matchScore ?? 0;
        const scoreB = b.matchScore ?? 0;
        

        if (Math.abs(scoreA - scoreB) > 2) {
          return scoreB - scoreA;
        }
        

        switch (sortBy) {
          case "popularity_desc":
            return b.popularity - a.popularity;
          case "price_asc":
            return Number(a.price ?? 0) - Number(b.price ?? 0);
          case "price_desc":
            return Number(b.price ?? 0) - Number(a.price ?? 0);
          case "alphabetical_asc":
            return a.name.localeCompare(b.name);
          case "alphabetical_desc":
            return b.name.localeCompare(a.name);
          default:
            return b.popularity - a.popularity;
        }
      });
    } else {
      switch (sortBy) {
        case "popularity_desc":
          items.sort((a, b) => b.popularity - a.popularity);
          break;
        case "price_asc":
          items.sort((a, b) => (Number(a.price ?? 0) - Number(b.price ?? 0)));
          break;
        case "price_desc":
          items.sort((a, b) => (Number(b.price ?? 0) - Number(a.price ?? 0)));
          break;
        case "alphabetical_asc":
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "alphabetical_desc":
          items.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    return items;
  }, [query, filters, sortBy]);

  const setRegion = useCallback((region: number | "") => {
    setFilters((f) => ({ ...f, region, city: "" }));
  }, []);

  const setPrice = (price: string | "") => setFilters((f) => ({ ...f, price }));

  const getResultsWithFilters = useCallback((hypotheticalFilters: Partial<SearchFilters>) => {
    let items = [...dataset.places];

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    const testFilters = { ...filters, ...hypotheticalFilters };

    if (testFilters.region) items = items.filter((p) => p.regionId === Number(testFilters.region));
    if (testFilters.city) items = items.filter((p) => p.cityId === Number(testFilters.city));
    if (testFilters.type) items = items.filter((p) => p.typeId === Number(testFilters.type));
    if (testFilters.tag) items = items.filter((p) => p.tags.includes(Number(testFilters.tag)));
    if (testFilters.price) {
      switch (testFilters.price) {
        case 'free':
          items = items.filter((p) => Number(p.price ?? 0) === 0);
          break;
        case 'low':
          items = items.filter((p) => Number(p.price ?? 0) > 0 && Number(p.price ?? 0) <= 500);
          break;
        case 'mid':
          items = items.filter((p) => Number(p.price ?? 0) > 500 && Number(p.price ?? 0) <= 1500);
          break;
        case 'high':
          items = items.filter((p) => Number(p.price ?? 0) > 1500);
          break;
      }
    }

    return items;
  }, [query, filters]);


  const availableOptions = useMemo(() => {
    const available: {
      types: Set<number>;
      cities: Set<number>;
      prices: Set<string>;
    } = {
      types: new Set(),
      cities: new Set(),
      prices: new Set(),
    };


    allTypes.forEach((type) => {
      if (filters.type === type.id) {
        available.types.add(type.id);
      } else {
        const testResults = getResultsWithFilters({ type: type.id });
        if (testResults.length > 0) {
          available.types.add(type.id);
        }
      }
    });

    allCities.forEach((city) => {
      const testResults = getResultsWithFilters({ city: city.id });
      if (filters.city === city.id) {
        available.cities.add(city.id);
      } else if (testResults.length > 0) {
        available.cities.add(city.id);
      }
    });

    const priceOptions = ['free', 'low', 'mid', 'high'];
    priceOptions.forEach((priceOption) => {
      const testResults = getResultsWithFilters({ price: priceOption });

      if (filters.price === priceOption) {
        available.prices.add(priceOption);
      } else if (testResults.length > 0) {
        available.prices.add(priceOption);
      }
    });

    return available;
  }, [getResultsWithFilters, filters]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    region: filters.region,
    setRegion,
    city: filters.city,
    setCity: (city: number | "") => setFilters((f) => ({ ...f, city })),
    type: filters.type,
    setType: (type: number | "") => setFilters((f) => ({ ...f, type })),
    tag: filters.tag,
    setTag: (tag: number | "") => setFilters((f) => ({ ...f, tag })),
    price: filters.price,
    setPrice,
    sortBy,
    setSortBy,
    results,
    total: results.length,
    availableOptions,
  };
}

export const allTypes = dataset.types;
export const allCities = dataset.cities;
export const allRegions = dataset.regions;

export function usePlaceDetails(id: number | string) {
  return useMemo(() => {
    const numId = Number(id);
    return dataset.places.find((p) => p.id === numId) ?? null;
  }, [id]);
}

export function usePlacesByCity(cityId: number | string, limit = 6) {
  return useMemo(() => {
    const num = Number(cityId);
    if (!num) return [] as Place[];
    return dataset.places.filter((p) => p.cityId === num).slice(0, limit);
  }, [cityId, limit]);
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      return exists ? prev.filter((f) => f !== id) : [...prev, id];
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}

export const getRegionName = (id: number) => dataset.regions.find((r) => r.id === id)?.name ?? "";
export const getCityName = (id: number) => dataset.cities.find((c) => c.id === id)?.name ?? "";
export const getTypeName = (id: number) => dataset.types.find((t) => t.id === id)?.name ?? "";
export const getTagName = (id: number) => dataset.tags.find((t) => t.id === id)?.name ?? "";

export const useCitiesByRegion = (regionId: number | "") => {
  return useMemo(() => {
    if (!regionId) return dataset.cities;
    return dataset.cities.filter((c) => c.regionId === Number(regionId));
  }, [regionId]);
};