import { parse } from "./deps.ts";

const TonkazVersion = "0.1.0";

const usage = () => {
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
};

export const parseArgs = async (args: string[]): Promise<[string, string]> => {
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

  const file1 = `${parsedArgs._[0]}`;
  const file1_is_file_or_remote = await is_file_or_remote(file1);
  !file1_is_file_or_remote && usage();
  const file2 = `${parsedArgs._[1]}`;
  const file2_is_file_or_remote = await is_file_or_remote(file2);
  !file2_is_file_or_remote && usage();

  return [file1, file2];
};

const is_file_or_remote = async (file: string): Promise<boolean> => {
  const isFile = await Deno.stat(file).then((stat) => stat.isFile).catch(() =>
    false
  );
  const isRemote = file.startsWith("http://") || file.startsWith("https://");

  return isFile || isRemote;
};
