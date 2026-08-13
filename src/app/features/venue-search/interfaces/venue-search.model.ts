export interface EventSubtype {
  id: string;
  eventTypeId: string;
  translationKey: string;
}

export interface VenueSearchCriteria {
  eventTypeId: string;
  eventSubtypeId?: string;
  guests?: number;
  city?: string;
  date?: string;
}