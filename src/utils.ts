export async function isFile(loc: string): Promise<boolean> {
  return await Deno.stat(loc).then((stat) => stat.isFile).catch(() => false);
}

export async function isRemote(loc: string): Promise<boolean> {
  return await fetch(loc).then((res) => res.ok).catch(() => false);
}

export async function is_file_or_remote(loc: string): Promise<boolean> {
  return await isFile(loc) || await isRemote(loc);
}

export type Json = Record<string, unknown>;

export async function load_json(
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
