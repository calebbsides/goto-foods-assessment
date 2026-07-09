"use client";

import { useEffect, useState } from "react";
import type { OrderSnapshot } from "@/lib/domain";

export function useOrderStream(orderId: string, initial: OrderSnapshot): OrderSnapshot {
  const [snapshot, setSnapshot] = useState(initial);

  useEffect(() => {
    const source = new EventSource(`/orders/${orderId}/stream`);
    source.onmessage = (event) => {
      try {
        setSnapshot(JSON.parse(event.data) as OrderSnapshot);
      } catch {
        // ignore malformed frames
      }
    };
    return () => source.close();
  }, [orderId]);

  return snapshot;
}
