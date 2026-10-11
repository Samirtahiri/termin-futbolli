"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useActions } from "@/hooks/useApp";
import { getSupabase } from "@/lib/supabase";

export function LogoutButton({
  variant = "ghost",
  size = "sm",
  className,
}: {
  variant?: "ghost" | "secondary" | "inverse";
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const { logoutOrganizer } = useActions();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={async () => {
        await getSupabase()?.auth.signOut();
        logoutOrganizer();
        router.push("/");
      }}
    >
      Dil
    </Button>
  );
}
