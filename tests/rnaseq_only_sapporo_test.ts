import { args, compare, crate } from "../src/mod.ts";

const CRATE_DIR = `${new URL(".", import.meta.url).pathname}example_crate`;

Deno.test("RNA-seq using only Sapporo test", async () => {
  const loc1 = `${CRATE_DIR}/rnaseq_1st.json`;
  const loc2 = `${CRATE_DIR}/rnaseq_only_sapporo.json`;

  const parsedArgs = await args.parseArgs([loc1, loc2]);
  const crate1 = new crate.Crate(parsedArgs.loc1);
  await crate1.initialize();
  const crate2 = new crate.Crate(parsedArgs.loc2);
  await crate2.initialize();
  compare.compare(crate1, crate2, parsedArgs.all, parsedArgs.threshold);
});
