export function createExpiry(baseTime?: number) {
  const now = baseTime ?? Date.now();

  function getSeconds(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return !parsed || isNaN(parsed) ? fallback : parsed;
  }

  function accessToken(role: string): Date {
    let seconds: number;

    switch (role) {
      case "admin":
        seconds = getSeconds(process.env.ACCESS_TOKEN_EXPIRY_ADMIN, 1800);
        break;

      case "superadmin":
        seconds = getSeconds(process.env.ACCESS_TOKEN_EXPIRY_SUPERADMIN, 1800);
        break;

      default:
        seconds = getSeconds(process.env.ACCESS_TOKEN_EXPIRY_USER, 3600);
    }

    return new Date(now + seconds * 1000);
  }

  function session(): Date {
    const seconds = getSeconds(process.env.SESSION_MAXAGE, 2592000);
    return new Date(now + seconds * 1000);
  }

  return {
    now: new Date(now),
    accessToken,
    session,
  };
}