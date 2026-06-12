  export const formatNumber = (
    value: string | number
  ) => {
    if (!value) return "";

    const num =
      typeof value === "string"
        ? Number(value.replace(/,/g, ""))
        : value;

    return num.toLocaleString("en-NG");
  };
