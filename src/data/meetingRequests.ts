import { MeetingRequest } from '../types';

export const meetingRequests: MeetingRequest[] = [
  {
    id: 'mr1',
    senderId: 'i1',
    receiverId: 'e1',
    title: 'Investment Discussion',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '10:00',
    message: 'I would like to discuss investment opportunities for your startup.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mr2',
    senderId: 'i2',
    receiverId: 'e1',
    title: 'Product Demo Review',
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    time: '14:00',
    message: 'Can we schedule a product demo session?',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mr3',
    senderId: 'e1',
    receiverId: 'i1',
    title: 'Funding Round Discussion',
    date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    time: '11:00',
    message: 'I would love to discuss our upcoming funding round.',
    status: 'accepted',
    createdAt: new Date().toISOString(),
  },
];