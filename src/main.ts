import { parseArgs } from "./argparse.ts";

const main = async (): Promise<void> => {
  const [file1, file2] = await parseArgs(Deno.args);
  console.log(file1, file2);
};

if (import.meta.main) {
  main();
}
