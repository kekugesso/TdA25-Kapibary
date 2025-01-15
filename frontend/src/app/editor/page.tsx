"use client";
import Editor from "@/components/game/Editor";

export default function EditorPage() {
  if (typeof window === "undefined") return null;
  const gameLocation = localStorage.getItem("gameLocation");
  return <Editor data={gameLocation || "boardData"} />;
}
