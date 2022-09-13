import { datetime } from "./deps.ts";

export async function isFile(loc: string): Promise<boolean> {
  return await Deno.stat(loc).then((stat) => stat.isFile).catch(() => false);
}

export async function isRemote(loc: string): Promise<boolean> {
  return await fetch(loc).then((res) => res.ok).catch(() => false);
}

export async function isFileOrRemote(loc: string): Promise<boolean> {
  return await isFile(loc) || await isRemote(loc);
}

export type Json = Record<string, unknown>;

export async function loadJson(
  loc: string,
): Promise<Record<string, unknown>> {
  if (await isFile(loc)) {
    const file_content = await Deno.readTextFile(loc);
    const json = JSON.parse(file_content);
    return json;
  }

  if (await isRemote(loc)) {
    const res = await fetch(loc);
    const json = await res.json();
    return json;
  }

  throw new Error(`Invalid location: ${loc}`);
}

export function intersection(ids_1: string[], ids_2: string[]): string[] {
  return ids_1.filter((id) => ids_2.includes(id));
}

export function difference(ids_1: string[], ids_2: string[]): string[] {
  return ids_1.filter((id) => !ids_2.includes(id));
}

export function formatDuration(
  duration: ReturnType<typeof datetime.difference>,
): string {
  const days = duration.days || 0;
  const hours = duration.hours != undefined ? duration.hours % 24 : 0;
  const minutes = duration.minutes != undefined ? duration.minutes % 60 : 0;
  const seconds = duration.seconds != undefined ? duration.seconds % 60 : 0;
  let formattedStr = "";
  if (days > 0) formattedStr += `${days}d `;
  if (hours > 0) formattedStr += `${hours}h `;
  if (minutes > 0) formattedStr += `${minutes}m `;
  if (seconds > 0) formattedStr += `${seconds}s`;
  if (formattedStr === "") formattedStr = "0s";
  return formattedStr.trim();
}

export function formatFileSize(
  fileSize: number,
): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unit = 0;
  while (fileSize > 1024) {
    fileSize /= 1024;
    unit += 1;
  }
  return `${fileSize.toFixed(2)} ${units[unit]}`;
}

export function tablePaddingLeft(table: string, padding: number): string {
  return table.split("\n").map((line) => " ".repeat(padding) + line).join("\n");
}
