import { EventCardModel } from '../interfaces/event-card.model';

export const EVENT_TYPES: EventCardModel[] = [

  {
    id: 'wedding',
    title: 'Wedding',
    description: 'Celebrate your special day.',
    icon: 'diamond'
  },

  {
    id: 'birthday',
    title: 'Birthday',
    description: 'Celebrate another year.',
    icon: 'cake'
  },

  {
    id: 'corporate',
    title: 'Corporate',
    description: 'Professional events.',
    icon: 'business_center'
  },

  {
    id: 'conference',
    title: 'Conference',
    description: 'Share knowledge and ideas.',
    icon: 'campaign'
  }

];