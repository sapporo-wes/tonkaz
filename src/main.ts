import { args, compare, crate } from "./mod.ts";

export const TonkazVersion = "0.1.0";

export async function main(): Promise<void> {
  try {
    const [loc1, loc2] = await args.parseArgs(Deno.args);
    const crate1 = new crate.Crate(loc1);
    await crate1.initialize();
    const crate2 = new crate.Crate(loc2);
    await crate2.initialize();
    compare.compare(crate1, crate2);
  } catch (e) {
    console.error(
      `%cError occurred!!%c: ${e.message}`,
      "color: red; font-weight: bold",
      "",
    );
    Deno.exit(1);
  }
  Deno.exit(0);
}

if (import.meta.main) {
  await main();
}
