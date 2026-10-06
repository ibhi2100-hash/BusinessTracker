export type UserRole =
  | "ADMIN"
  | "STAFF";

export function getHomeRoute(
  role?: UserRole,
): string {
  switch (role) {
    case "STAFF":
      return "/sales";

    case "ADMIN":
      return "/dashboard";

    default:
      return "/login";
  }
}