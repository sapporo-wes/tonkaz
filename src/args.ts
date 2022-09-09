import { flags } from "./deps.ts";
import { main, utils } from "./mod.ts";

function usage(): void {
  console.log(
    `\
Tonkaz ${main.TonkazVersion} by @suecharo

CLI tool to verify workflow reproducibility

%cUsage:%c tonkaz [options] file1 file2

%cOptions:%c
  -h, --help    Show this help message and exit.
  -v, --version Show version and exit.

%cExamples:%c
  $ tonkaz file1 file2
  $ tonkaz file1 https://example.com/file2
  $ tonkaz https://example.com/file1 https://example.com/file2\
`,
    "color: blue",
    "",
    "color: blue",
    "",
    "color: blue",
    "",
  );
  Deno.exit(1);
}

export async function parseArgs(args: string[]): Promise<string[]> {
  const parsedArgs = flags.parse(args, {
    boolean: ["help", "version"],
    alias: {
      h: "help",
      v: "version",
    },
  });

  parsedArgs.help && usage();
  if (parsedArgs.version) {
    console.log(main.TonkazVersion);
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
