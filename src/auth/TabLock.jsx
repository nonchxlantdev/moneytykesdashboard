import { useEffect, useState } from "react";

const CHANNEL = "moneytykes-dashboard-tab-lock";

/**
 * Only one browser tab may use the dashboard at a time.
 * Followers see a blocking message; the first/primary tab keeps working.
 */
export default function TabLock({ enabled, children }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return undefined;
    }

    const channel = new BroadcastChannel(CHANNEL);
    let isLeader = false;
    let sawPeer = false;

    const becomeLeader = () => {
      isLeader = true;
      setBlocked(false);
    };

    const onMessage = event => {
      const type = event?.data?.type;
      if (type === "ping") {
        if (isLeader) channel.postMessage({ type: "pong" });
      } else if (type === "pong") {
        sawPeer = true;
        if (!isLeader) setBlocked(true);
      } else if (type === "leader-claim" && !isLeader) {
        setBlocked(true);
      }
    };

    channel.addEventListener("message", onMessage);
    channel.postMessage({ type: "ping" });

    const timer = window.setTimeout(() => {
      if (!sawPeer) {
        becomeLeader();
        channel.postMessage({ type: "leader-claim" });
      } else {
        setBlocked(true);
      }
    }, 120);

    return () => {
      window.clearTimeout(timer);
      channel.removeEventListener("message", onMessage);
      channel.close();
    };
  }, [enabled]);

  if (!enabled) return children;

  if (blocked) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#F5F7FB",
          color: "#10162F",
          textAlign: "center",
          fontFamily: "inherit"
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem" }}>Already open in another tab</h1>
          <p style={{ margin: 0, color: "#687188", lineHeight: 1.5 }}>
            MoneyTykes Dashboard is already running in another browser tab. Close this tab and continue
            there, or close the other tab and refresh this one.
          </p>
        </div>
      </main>
    );
  }

  return children;
}
