import algoliasearch from "algoliasearch";
import { UserModel } from "../types/user_model";
import { tlogger } from "../utils/logger";

const ALGOLIA_APPLICATION_ID = process.env["ALGOLIA_APPLICATION_ID"] ?? "";
const ALGOLIA_API_KEY = process.env["ALGOLIA_API_KEY"] ?? "";
const ALGOLIA_USER_INDEX= process.env["ALGOLIA_USER_INDEX"] ?? "";

if (ALGOLIA_APPLICATION_ID === "" || ALGOLIA_API_KEY === "" || ALGOLIA_USER_INDEX === "") {
  tlogger.error("ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY, ALGOLIA_USER_INDEX must be set");
  process.exit(1);
}

const client = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
const usersIndex = client.initIndex(ALGOLIA_USER_INDEX);

export type BoundingBox = {
    readonly sw: { lat: number, lng: number },
    readonly ne: { lat: number, lng: number },
};

export type UserSearchOptions = {
    hitsPerPage: number;
    labels?: string[];
    genres?: string[];
    occupations?: string[];
    occupationsBlackList?: string[],
    venueGenres?: string[];
    unclaimed?: boolean;
    lat?: number;
    lng?: number;
    radius?: number;
    minCapacity?: number;
    maxCapacity?: number;
  };

export async function queryVenuesInBoundedBox(bounds: BoundingBox | null, {
  hitsPerPage,
  venueGenres,
  unclaimed,
  minCapacity,
  maxCapacity,
}: UserSearchOptions): Promise<UserModel[]> {
  const formattedIsVenueFilter = "occupations:Venue OR occupations:venue";
  const formattedIsDeletedFilter = "deleted:false";
  const formattedVenueGenreFilter = venueGenres != null ?
    `(${venueGenres.map((e) => `venueInfo.genres:'${e}'`).join(" OR ")})` :
    null;
  const formattedUnclaimedFilter = unclaimed != null ?
    `unclaimed:${unclaimed}` :
    null;
  
  const filters = [
    formattedIsVenueFilter,
    formattedIsDeletedFilter,
    formattedVenueGenreFilter,
    formattedUnclaimedFilter,
  ].filter((element) => element !== null);
  const filtersStr = filters.join(" AND ");
  
  try {
    const numbericFilters: string[] = [];
  
    if (minCapacity != null) {
      numbericFilters.push(`venueInfo.capacity>=${minCapacity}`);
    }
  
    if (maxCapacity != null) {
      numbericFilters.push(`venueInfo.capacity<=${maxCapacity}`);
    }
  
    const response = await usersIndex.search<UserModel>("", {
      filters: filtersStr,
      insideBoundingBox: bounds === null ?
        undefined :
        [[bounds.sw.lat, bounds.sw.lng, bounds.ne.lat, bounds.ne.lng]],
      hitsPerPage: hitsPerPage,
      numericFilters: numbericFilters,
    });
  
    return response.hits;
  } catch (e) {
    tlogger.error(e);
    return [];
  }
}
  
  
export async function queryUsers(query: string, {
  hitsPerPage,
  labels,
  genres,
  occupations,
  occupationsBlackList,
  venueGenres,
  unclaimed,
  lat,
  lng,
  radius = 50_000,
  minCapacity,
  maxCapacity,
}: UserSearchOptions): Promise<UserModel[]> {
  const occupationsIntersection = occupations != null && occupationsBlackList != null ?
    occupations.filter((e) => occupationsBlackList.includes(e)) :
    null;

  if (occupationsIntersection !== null && occupationsIntersection.length > 0) {
    tlogger.error("occupations and occupationsBlackList have intersection");
    return [];
  }

  const formattedIsDeletedFilter = "deleted:false";
  const formattedLabelFilter = labels != null ?
    `(${labels.map((e) => `performerInfo.label:'${e}'`).join(" OR ")})` :
    null;
  const formattedGenreFilter = genres != null ?
    `(${genres.map((e) => `performerInfo.genres:'${e}'`).join(" OR ")})` :
    null;
  const formattedOccupationFilter = occupations != null ?
    `(${occupations.map((e) => `occupations:'${e}'`).join(" OR ")})` :
    null;
  const formattedOccupationBlackListFilter = occupationsBlackList != null ?
    `(${occupationsBlackList.map((e) => `NOT occupations:'${e}'`).join(" AND ")})` :
    null;
  const formattedVenueGenreFilter = venueGenres != null ?
    `(${venueGenres.map((e) => `venueInfo.genres:'${e}'`).join(" OR ")})` :
    null;
  const formattedUnclaimedFilter = unclaimed != null ?
    `unclaimed:${unclaimed}` :
    null;
  
  const filters = [
    formattedIsDeletedFilter,
    formattedLabelFilter,
    formattedGenreFilter,
    formattedOccupationFilter,
    formattedOccupationBlackListFilter,
    formattedVenueGenreFilter,
    formattedUnclaimedFilter,
  ].filter((element) => element !== null);
  const filtersStr = filters.join(" AND ");
  
  const formattedLocationFilter =
      (lat != null && lng != null) ? `${lat}, ${lng}` : undefined;
  
  try {
    const numbericFilters: string[] = [];
  
    if (minCapacity != null) {
      numbericFilters.push(`venueInfo.capacity>=${minCapacity}`);
    }
  
    if (maxCapacity != null) {
      numbericFilters.push(`venueInfo.capacity<=${maxCapacity}`);
    }
  
    tlogger.debug({ 
      query, 
      filtersStr, 
      hitsPerPage, 
      radius, 
      formattedLocationFilter, 
      numbericFilters,
    });
  
    const response = await usersIndex.search<UserModel>(query, {
      filters: filtersStr,
      hitsPerPage: hitsPerPage ?? 10,
      aroundRadius: radius,
      aroundLatLng: formattedLocationFilter,
      numericFilters: numbericFilters,
    });
  
    return response.hits;
  } catch (e) {
    tlogger.error(e);
    return [];
  }
}
