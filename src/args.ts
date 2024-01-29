import * as colors from "colors";
import { parseArgs as parse } from "parse_args";

import { compare, main, utils } from "./mod.ts";

function usage(): void {
  console.log(`\
Tonkaz ${main.TonkazVersion} by @suecharo

CLI tool to verify workflow reproducibility

${colors.blue("Usage:")} tonkaz [options] crate1 crate2

${colors.blue("Options:")}
  -a, --all                    Use all output files for comparison
  -t, --threshold <threshold>  Set threshold for comparison (default: ${compare.DEFAULT_THRESHOLD})
  -j, --json                   Output result as JSON
  -h, --help                   Show this help message and exit
  -v, --version                Show version and exit

${colors.blue("Examples:")}
  $ tonkaz crate1 crate2
  $ tonkaz crate1 https://example.com/crate2
  $ tonkaz https://example.com/crate1 https://example.com/crate2`);
  Deno.exit(1);
}

export interface Args {
  all: boolean;
  threshold: number;
  loc1: string;
  loc2: string;
  json: boolean;
}

export async function parseArgs(args: string[]): Promise<Args> {
  const parsedArgs = parse(args, {
    boolean: ["all", "help", "version", "json"],
    string: ["threshold"],
    alias: {
      a: "all",
      t: "threshold",
      h: "help",
      v: "version",
      j: "json",
    },
  });

  parsedArgs.help && usage();
  if (parsedArgs.version) {
    console.log(main.TonkazVersion);
    Deno.exit(0);
  }
  if (parsedArgs._.length !== 2) {
    throw new Error("Invalid number of arguments (expected: 2)");
  }

  const loc1 = `${parsedArgs._[0]}`;
  const loc1_isFileOrRemote = await utils.isFileOrRemote(loc1);
  if (!loc1_isFileOrRemote) {
    throw new Error(`Invalid location: ${loc1}`);
  }

  const loc2 = `${parsedArgs._[1]}`;
  const loc2_isFileOrRemote = await utils.isFileOrRemote(loc2);
  if (!loc2_isFileOrRemote) {
    throw new Error(`Invalid location: ${loc2}`);
  }

  let threshold: number;
  if (parsedArgs.threshold == undefined) {
    threshold = compare.DEFAULT_THRESHOLD;
  } else {
    threshold = Number(parsedArgs.threshold);
    if (Number.isNaN(threshold)) {
      throw new Error("Threshold must be a number");
    }
    if (threshold < 0 || threshold > 1) {
      throw new Error("Threshold must be between 0 and 1");
    }
  }

  return {
    all: parsedArgs.all,
    threshold: threshold,
    loc1,
    loc2,
    json: parsedArgs.json,
  };
}
