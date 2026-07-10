"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";
import { useIdleTimer } from "react-idle-timer";

const IDLE_LIMIT = Number(process.env.NEXT_PUBLIC_IDLE_LIMIT) || 60000;

const REFRESH_BUFFER = Number(process.env.NEXT_PUBLIC_REFRESH_BUFFER) || 60000;

export default function SessionManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, update, status } = useSession();

  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  const isRefreshing = useRef(false);

  const retryCount = useRef(0);

  const MAX_RETRIES = 3;

  const isIdle = useRef(false);

  const isOffline = useRef(false);

  const refreshToken = useCallback(async () => {
    if (!session?.refreshToken || !session?.sessionToken) {
      console.log("❌ No session available");
      return;
    }

    if (isIdle.current) {
      console.log("⛔ Skip refresh (USER IDLE)");
      return;
    }

    if (isOffline.current) {
      console.log("⛔ Skip refresh (OFFLINE)");
      return;
    }

    if (isRefreshing.current) {
      console.log("⛔ Refresh already running");
      return;
    }

    if (retryCount.current >= MAX_RETRIES) {
      console.log("❌ Max retries reached → logout");

      await signOut({
        redirect: true,
        callbackUrl: "/auth/login",
      });

      return;
    }

    isRefreshing.current = true;

    console.log("🔄 Refreshing token...");

    try {
      const res = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken,
          sessionToken: session.sessionToken,
        }),
      });

      if (!res.ok) {
        retryCount.current++;

        console.log("❌ Refresh failed", res.status);

        if (res.status === 401) {
          console.log("❌ Session invalid → logout");

          await signOut({
            redirect: true,
            callbackUrl: "/auth/login",
          });
        }

        return;
      }

      const data = await res.json();

      retryCount.current = 0;

      await update({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpires: data.accessTokenExpires,
      });
    } catch (err) {
      retryCount.current++;

      console.log("❌ Refresh error", err);
    } finally {
      isRefreshing.current = false;
    }
  }, [session, update]);

  const setupRefreshTimer = useCallback(() => {
    if (!session?.accessTokenExpires) return;

    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }

    const expires = new Date(session.accessTokenExpires).getTime();

    const now = Date.now();

    const refreshTime = Math.max(expires - now - REFRESH_BUFFER, 0);

    if (refreshTime <= 0) {
      refreshToken();
      return;
    }

    refreshTimeout.current = setTimeout(() => {
      refreshToken();
    }, refreshTime);
  }, [session?.accessTokenExpires, refreshToken]);

  useIdleTimer({
    timeout: IDLE_LIMIT,

    onIdle: () => {
      isIdle.current = true;

      console.log("🔴 USER OFFLINE (IDLE)");

      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    },

    onActive: () => {
      isIdle.current = false;

      console.log("🟢 USER ONLINE");

      setupRefreshTimer();
    },

    crossTab: true,

    stopOnIdle: true,

    syncTimers: 200,
  });

  useEffect(() => {
    const handleOffline = () => {
      isOffline.current = true;

      console.log("🔴 NETWORK OFFLINE");

      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    };

    const handleOnline = () => {
      isOffline.current = false;

      console.log("🟢 NETWORK ONLINE");

      setupRefreshTimer();
    };

    window.addEventListener("offline", handleOffline);

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);

      window.removeEventListener("online", handleOnline);
    };
  }, [setupRefreshTimer]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        console.log("🔴 TAB HIDDEN");

        isIdle.current = true;

        if (refreshTimeout.current) {
          clearTimeout(refreshTimeout.current);
          refreshTimeout.current = null;
        }
      } else {
        console.log("🟢 TAB ACTIVE");

        isIdle.current = false;

        setupRefreshTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [setupRefreshTimer]);

  useEffect(() => {
    if (status === "authenticated" && session?.accessTokenExpires) {
      console.log("🟢 Session active");

      setupRefreshTimer();
    }

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [status, session?.accessTokenExpires, setupRefreshTimer]);

  return <>{children}</>;
}