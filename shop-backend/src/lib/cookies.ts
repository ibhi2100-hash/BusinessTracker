import type { Response, CookieOptions } from "express";

const isProduction =
  process.env.NODE_ENV === "production";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie(
    "accessToken",
    accessToken,
    accessCookieOptions
  );

  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions
  );
}

export function setRefreshCookie(
  res: Response,
  refreshToken: string
) {
  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions
  );
}

export function clearRefreshCookie(
  res: Response
) {
  res.clearCookie(
    "refreshToken",
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? "none"
        : "lax",
      path: "/",
    }
  );
}