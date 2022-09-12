import { crate, main, utils } from "./mod.ts";
import { asciiTable, datetime } from "./deps.ts";

export function compare(
  crate1: crate.Crate,
  crate2: crate.Crate,
  all: boolean,
): void {
  renderFirstMsg(crate1, crate2);
  crate1.summarize();
  crate2.summarize();
  renderSummaryTable(crate1, crate2);
  renderEdamExt();
  console.log(""); // empty line
  compareOutputs(crate1, crate2, all);
}

export function renderFirstMsg(crate1: crate.Crate, crate2: crate.Crate): void {
  console.log(
    `\
Tonkaz ${main.TonkazVersion}

%cComparing%c these files:

  Crate1: %c${crate1.location}%c
  Crate2: %c${crate2.location}%c
`,
    "color: green",
    "",
    "color: cyan",
    "",
    "color: cyan",
    "",
  );
}

export function renderSummaryTable(
  crate1: crate.Crate,
  crate2: crate.Crate,
): void {
  const ellipseVal = (val: string) => {
    if (val.length <= 36) return val;
    return val.slice(0, 10) + " ... " + val.slice(-21);
  };

  const data: asciiTable.AsciiData = {
    title: "",
    heading: [
      "",
      asciiTable.default.alignCenter(ellipseVal(crate1.location), 36, " "),
      asciiTable.default.alignCenter(ellipseVal(crate2.location), 36, " "),
    ],
    rows: [],
  };

  const headerToField: [string, keyof crate.Summary][] = [
    ["WF Name", "wfName"],
    ["WF ID", "wfId"],
    ["WF Version", "wfVersion"],
    ["WF Type", "wfType"],
    ["WF TypeVersion", "wfTypeVersion"],
    ["Test ID", "testId"],
    ["Test State", "state"],
    ["Test ExitCode", "exitCode"],
    ["Start Time", "startTime"],
    ["End Time", "endTime"],
    ["Duration", "duration"],
    ["# Attachments", "wfAttachments"],
    ["# Intermediate", "intermediateFiles"],
    ["# Outputs", "outputs"],
    ["# Outputs with EDAM", "outputsWithEdam"],
  ];

  headerToField.forEach(([header, key]) => {
    if (header.includes("#")) {
      if (key === "outputsWithEdam") {
        // do nothing
      } else {
        data.rows.push([
          header,
          ...[crate1, crate2].map((c) =>
            `${(c.summary[key] as string[]).length} files${
              key === "outputs"
                ? ` (${c.summary.outputsWithEdam.length} EDAM-assigned files)`
                : ""
            }`
          ),
        ]);
      }
    } else if (header.includes("Time")) {
      data.rows.push([
        header,
        ...[crate1, crate2].map((c) =>
          c.summary[key] != undefined
            ? datetime.format(
              c.summary[key] as Date,
              "yyyy-MM-dd HH:mm:ss",
            )
            : ""
        ),
      ]);
    } else if (key === "duration") {
      data.rows.push([
        header,
        ...[crate1, crate2].map((c) => {
          if (c.summary[key] === undefined) return "";
          const duration = c.summary[key] as ReturnType<
            typeof datetime.difference
          >;
          const days = duration.days || 0;
          const hours = duration.hours != undefined ? duration.hours % 24 : 0;
          const minutes = duration.minutes != undefined
            ? duration.minutes % 60
            : 0;
          const seconds = duration.seconds != undefined
            ? duration.seconds % 60
            : 0;
          return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }),
      ]);
    } else {
      data.rows.push([
        header,
        ...[crate1, crate2].map((c) =>
          c.summary[key] != undefined ? ellipseVal(`${c.summary[key]}`) : ""
        ),
      ]);
    }
  });

  const table = asciiTable.default.fromJSON(data);
  table.setAlign(1, asciiTable.AsciiAlign.LEFT);
  table.setAlign(2, asciiTable.AsciiAlign.LEFT);

  console.log(table.toString());
}

export function renderEdamExt(): void {
  const ext = Object.keys(crate.EDAM_MAPPING);
  console.log(`  * EDAM extensions: ${ext.join("/")}`);
}

export function compareOutputs(
  crate1: crate.Crate,
  crate2: crate.Crate,
  all: boolean,
): void {
  console.log(
    `\
%cComparing%c output files to verify their reproducibility${
      !all
        ? " (using only EDAM-assigned files, option \`--all`\ to use all files)"
        : ""
    }`,
    "color: green",
    "",
  );

  const crate1_ids = all
    ? crate1.summary.outputs
    : crate1.summary.outputsWithEdam;
  const crate2_ids = all
    ? crate2.summary.outputs
    : crate2.summary.outputsWithEdam;

  const both_ids = utils.intersection(crate1_ids, crate2_ids);
  const only1_ids = utils.difference(crate1_ids, crate2_ids);
  const only2_ids = utils.difference(crate2_ids, crate1_ids);

  const has_diff_ids = only1_ids.length > 0 || only2_ids.length > 0;
  if (has_diff_ids) {
    renderDiffFiles(only1_ids, only2_ids, new RegExp("^outputs/"));
  }
}

export function renderDiffFiles(
  ids1: string[],
  ids2: string[],
  trim_prefix_regex: RegExp,
): void {
  const ellipseVal = (val: string) => {
    if (val.length <= 36) return val;
    return val.slice(0, 10) + " ... " + val.slice(-21);
  };

  console.log(
    `%cFound differences%c in output files:`,
    "color: yellow",
    "",
  );
  const data: asciiTable.AsciiData = {
    title: "",
    heading: [
      "File",
      asciiTable.default.alignCenter("in Crate1", 11, " "),
      asciiTable.default.alignCenter("in Crate2", 11, " "),
    ],
    rows: [],
  };
  const sortedIds = [...ids1, ...ids2].sort();
  sortedIds.forEach((id) => {
    data.rows.push([
      asciiTable.default.alignLeft(
        ellipseVal(id.replace(trim_prefix_regex, "")),
        36,
        " ",
      ),
      ids1.includes(id) ? asciiTable.default.alignCenter("✓", 11, " ") : "",
      ids2.includes(id) ? asciiTable.default.alignCenter("✓", 11, " ") : "",
    ]);
  });

  const table = asciiTable.default.fromJSON(data);

  console.log(table.toString());
}
