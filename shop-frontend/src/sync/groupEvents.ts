export function groupEventsByAggregate(
  events: any[]
) {
  const map = new Map<string, any[]>()

  for (const event of events) {
    const key =
      `${event.aggregateType}:${event.aggregateId}`

    if (!map.has(key)) {
      map.set(key, [])
    }

    map.get(key)!.push(event)
  }

  return Array.from(map.values())
}