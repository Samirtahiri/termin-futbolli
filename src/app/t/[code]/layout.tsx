"use client";

import { useParams } from "next/navigation";
import { useMatchSync } from "@/hooks/useRemote";

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { code } = useParams<{ code: string }>();
  useMatchSync(code);
  return children;
}
