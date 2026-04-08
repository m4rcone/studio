import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/studio/auth";
import { StudioShell } from "@/components/studio/layout/StudioShell";

export const metadata = {
  title: "Studio",
};

export default async function StudioPage() {
  try {
    await verifyAuth();
  } catch {
    redirect("/studio/login");
  }

  return <StudioShell />;
}
