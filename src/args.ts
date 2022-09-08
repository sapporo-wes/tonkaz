import { parse } from "./deps.ts";
import { utils } from "./mod.ts";

const TonkazVersion = "0.1.0";

function usage(): void {
  console.log(`\
Tonkaz ${TonkazVersion} by @suecharo

CLI tool to verify workflow reproducibility

Usage: tonkaz [options] file1 file2

Options:
  -h, --help    Show this help message and exit.
  -v, --version Show version and exit.

Examples:
  tonkaz file1 file2
  tonkaz file1 https://example.com/file2
  tonkaz https://example.com/file1 https://example.com/file2\
`);
  Deno.exit(1);
}

export async function parseArgs(args: string[]): Promise<string[]> {
  const parsedArgs = parse(args, {
    boolean: ["help", "version"],
    alias: {
      h: "help",
      v: "version",
    },
  });

  parsedArgs.help && usage();
  if (parsedArgs.version) {
    console.log(TonkazVersion);
    Deno.exit(0);
  }
  parsedArgs._.length !== 2 && usage();

  const loc1 = `${parsedArgs._[0]}`;
  const loc1_isFileOrRemote = await utils.isFileOrRemote(loc1);
  !loc1_isFileOrRemote && usage();

  const loc2 = `${parsedArgs._[1]}`;
  const loc2_isFileOrRemote = await utils.isFileOrRemote(loc2);
  !loc2_isFileOrRemote && usage();

  return [loc1, loc2];
}
