import React from 'react'
import { Event } from '../domain/event.js'

export const deterministicSort = (events: Event[]) => {
  return (
    [...events].sort((a, b) => {
      if (a.createdAt < b.createdAt) return -1;
      if (a.createdAt > b.createdAt) return 1;
      return 0;
    })
  )
  
}

