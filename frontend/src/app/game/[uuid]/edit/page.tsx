"use server";

import { LoadEditor } from "./LoadEditor";

export default async function AsyncLoader({
  params,
}: {
  params: Promise<any>;
}) {
  return <LoadEditor uuid={(await params).uuid} />;
}
