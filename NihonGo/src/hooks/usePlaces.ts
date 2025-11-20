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
    // If the place JSON doesn't contain region info, try to derive it from the cities list in the raw data
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

    return items;
  }, [query, filters, sortBy]);

  const setRegion = useCallback((region: number | "") => {
    setFilters((f) => ({ ...f, region, city: "" }));
  }, []);

  const setPrice = (price: string | "") => setFilters((f) => ({ ...f, price }));

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
  };
}

// Export lists for use in UI
export const allTypes = dataset.types;
export const allCities = dataset.cities;
export const allRegions = dataset.regions;

export function usePlaceDetails(id: number | string) {
  return useMemo(() => {
    const numId = Number(id);
    return dataset.places.find((p) => p.id === numId) ?? null;
  }, [id]);
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