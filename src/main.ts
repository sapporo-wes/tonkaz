import { args, compare, crate } from "./mod.ts";
import { color } from "./deps.ts";

export const TonkazVersion = "0.2.2";

export async function main(): Promise<void> {
  try {
    const parsedArgs = await args.parseArgs(Deno.args);
    const crate1 = new crate.Crate(parsedArgs.loc1);
    await crate1.initialize();
    const crate2 = new crate.Crate(parsedArgs.loc2);
    await crate2.initialize();
    compare.compare(
      crate1,
      crate2,
      parsedArgs.all,
      parsedArgs.threshold,
      parsedArgs.json,
    );
  } catch (e) {
    console.error(`${color.red("Error occurred!!")}: ${e.message}`);
    Deno.exit(1);
  }
  Deno.exit(0);
}

if (import.meta.main) {
  await main();
}
