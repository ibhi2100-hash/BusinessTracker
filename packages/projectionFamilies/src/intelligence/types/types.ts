export interface IntelligenceReducer<
  State = any,
  Input = any
> {

  initialState(): State;

  reduce(
    state: State,
    input: Input
  ): State;

}

export interface Suggestion {

  id: string;

  type:
    | "REORDER"
    | "PRICE_INCREASE"
    | "PRICE_DECREASE"
    | "FOLLOW_UP_CUSTOMER"
    | "LOW_CASH_WARNING"
    | "SLOW_MOVING_STOCK";

  title: string;

  description: string;

  confidence: number;

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  createdAt: number;
}