import { IntegrationEvent } from "@business/shared-types";

export const DashboardSnapshotReducer = {

  aggregateType : "DASHBOARD",

  initialState() {

    return {
      salesCount: 0,
      revenue: 0,
      inventoryValue: 0,
      profit: 0
    };
  },

  reduce(
    current: any,
    event: IntegrationEvent
  ) {

    switch(event.type) {

      case "SALE_ADDED":

        return {

          ...current,

          salesCount:
            current.salesCount + 1,

          revenue:
            current.revenue +
            event.payload.total,

          profit:
            current.profit +
            event.payload.profit
        };

      default:
        return current;
    }
  }
}