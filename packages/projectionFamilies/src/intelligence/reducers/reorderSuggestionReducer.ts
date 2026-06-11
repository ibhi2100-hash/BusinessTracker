export const ReorderSuggestionReducer = {

  initialState: () => [],

  reduce(state: any, metric: any) {

    if(metric.daysOfStockLeft > 7) {
      return state;
    }

    return [

      ...state,

      {
        id: crypto.randomUUID(),

        type: "REORDER",

        title:
          "Inventory Running Low",

        description:
          `${metric.productName}
           will run out in
           ${Math.floor(
             metric.daysOfStockLeft
           )} days`,

        confidence: 92,

        priority:
          metric.daysOfStockLeft <= 3
          ? "HIGH"
          : "MEDIUM",

        createdAt: Date.now()
      }

    ];
  }
};