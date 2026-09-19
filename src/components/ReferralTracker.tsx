"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ReferralTrackerContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      const cleanRef = refCode.trim().toUpperCase();
      localStorage.setItem("autorecurso_referral_code", cleanRef);
      document.cookie = `referral_code=${encodeURIComponent(
        cleanRef
      )}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  }, [searchParams]);

  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerContent />
    </Suspense>
  );
}
