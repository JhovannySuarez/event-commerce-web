import { EventCardModel } from '../interfaces/event-card.model';

export const EVENT_TYPES: EventCardModel[] = [

{
    id: 'social',
    title: 'Social Event',
    description: 'Weddings, birthdays, anniversaries and more.',
    icon: 'celebration'
  },

  {
    id: 'corporate',
    title: 'Corporate Event',
    description: 'Meetings, product launches and business events.',
    icon: 'business_center'
  },

  {
    id: 'other',
    title: 'Custom Event',
    description: "Tell us what you're planning.",
    icon: 'auto_awesome'
  }

];