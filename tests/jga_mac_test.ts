import { args, compare, crate } from "../src/mod.ts";

const CRATE_DIR = `${new URL(".", import.meta.url).pathname}example_crate`;

Deno.test("JGA Mac test", async () => {
  const loc1 = `${CRATE_DIR}/jga_1st.json`;
  const loc2 = `${CRATE_DIR}/jga_mac.json`;

  const parsedArgs = await args.parseArgs([loc1, loc2]);
  const crate1 = new crate.Crate(parsedArgs.loc1);
  await crate1.initialize();
  const crate2 = new crate.Crate(parsedArgs.loc2);
  await crate2.initialize();
  compare.compare(crate1, crate2, parsedArgs.all, parsedArgs.threshold);
});
