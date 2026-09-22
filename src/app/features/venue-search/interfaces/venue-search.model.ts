export type SearchTier = 'Q1' | 'Q2' | 'Q3';

export interface VenueSearchCriteria {
  cityId: string;
  eventTypeId: string;
  eventDate: string;
  requestedGuests: number;
}

export interface VenueSearchRequest extends VenueSearchCriteria {
  tier: SearchTier;
  page: number;
  pageSize: number;
}

export interface AvailableSlot {
  from: string;
  until: string;
  hours: number;
}

export interface AvailableDate {
  availableDate: string;
  availableHours: number | null;
  availableSlots: AvailableSlot[];
}

export interface VenueSearchResult {
  eventSpaceId: string;
  eventSpaceName: string;
  venueId: string;
  description: string | null;
  address: string | null;
  averageRating: number | null;
  reviewCount: number | null;
  capacityMin: number | null;
  capacityMax: number | null;
  bookingMode: 'FULL_DAY' | 'HOURLY';
  minimumHours: number | null;
  availableDates: AvailableDate[];
}

export interface VenueSearchResponse {
  results: VenueSearchResult[];
  tier: SearchTier;
  hasMore: boolean;
  hasNextTier: boolean;
}
