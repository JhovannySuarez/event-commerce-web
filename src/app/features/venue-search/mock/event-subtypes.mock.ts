import { EventSubtype } from '../interfaces/venue-search.model';

export const EVENT_SUBTYPES: EventSubtype[] = [

  // Social events

  {
    id: 'wedding',
    eventTypeId: 'social',
    translationKey: 'wedding'
  },

  {
    id: 'birthday',
    eventTypeId: 'social',
    translationKey: 'birthday'
  },

  {
    id: 'anniversary',
    eventTypeId: 'social',
    translationKey: 'anniversary'
  },

  {
    id: 'first-communion',
    eventTypeId: 'social',
    translationKey: 'firstCommunion'
  },

  {
    id: 'baby-shower',
    eventTypeId: 'social',
    translationKey: 'babyShower'
  },

  {
    id: 'other',
    eventTypeId: 'social',
    translationKey: 'other'
  },

  // Corporate events

  {
    id: 'conference',
    eventTypeId: 'corporate',
    translationKey: 'conference'
  },

  {
    id: 'meeting',
    eventTypeId: 'corporate',
    translationKey: 'meeting'
  },

  {
    id: 'product-launch',
    eventTypeId: 'corporate',
    translationKey: 'productLaunch'
  },

  {
    id: 'workshop',
    eventTypeId: 'corporate',
    translationKey: 'workshop'
  },

  {
    id: 'other',
    eventTypeId: 'corporate',
    translationKey: 'other'
  }

];