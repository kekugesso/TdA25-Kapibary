"use server";

import { LoadGame } from "./LoadGame";

export default async function AsyncLoader({
  params,
}: {
  params: Promise<any>;
}) {
  return <LoadGame uuid={(await params).uuid} />;
}
