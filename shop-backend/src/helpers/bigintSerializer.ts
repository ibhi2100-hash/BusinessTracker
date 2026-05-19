// src/helpers/bigintSerializer.ts

export function serializeBigInt(data: any): any {
  return JSON.parse(
    JSON.stringify(
      data,
      (_, value) =>
        typeof value === "bigint"
          ? Number(value)
          : value
    )
  );
}