"use server";

import { LoadGame } from "./LoadGame";

export default async function AsyncLoader({
  params,
}: {
  params: () => Promise<{ uuid: string }>;
}) {
  return <LoadGame uuid={(await params).uuid} />;
}
