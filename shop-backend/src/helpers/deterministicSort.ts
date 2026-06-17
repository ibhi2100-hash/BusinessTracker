import { BaseEvent } from '@business/shared-types';

export const deterministicSort = (events: BaseEvent[]) => {
  return (
    [...events].sort((a, b) => {
      if (a.createdAt < b.createdAt) return -1;
      if (a.createdAt > b.createdAt) return 1;
      return 0;
    })
  )
  
}

