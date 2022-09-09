import { crate, main } from "./mod.ts";
import { asciiTable, datetime } from "./deps.ts";

export function compare(
  crate1: crate.Crate,
  crate2: crate.Crate,
): void {
  renderFirstMsg(crate1, crate2);
  crate1.summarize();
  crate2.summarize();
  renderSummaryTable(crate1, crate2);
}

export function renderFirstMsg(crate1: crate.Crate, crate2: crate.Crate): void {
  console.log(
    `\
Tonkaz ${main.TonkazVersion}

Comparing these files:

  - %c${crate1.location}%c
  - %c${crate2.location}%c
`,
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
      asciiTable.default.alignCenter(ellipseVal(crate1.location), 36),
      asciiTable.default.alignCenter(ellipseVal(crate2.location), 36),
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
  ];

  headerToField.forEach((pair) => {
    if (pair[0].includes("#")) {
      data.rows.push([
        pair[0],
        ...[crate1, crate2].map((c) =>
          `${(c.summary[pair[1]] as string[]).length} files`
        ),
      ]);
    } else if (pair[0].includes("Time")) {
      data.rows.push([
        pair[0],
        ...[crate1, crate2].map((c) =>
          c.summary[pair[1]] != undefined
            ? datetime.format(
              c.summary[pair[1]] as Date,
              "yyyy-MM-dd HH:mm:ss",
            )
            : ""
        ),
      ]);
    } else if (pair[0] === "Duration") {
      data.rows.push([
        pair[0],
        ...[crate1, crate2].map((c) => {
          if (c.summary[pair[1]] === undefined) return "";
          const duration = c.summary[pair[1]] as ReturnType<
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
        pair[0],
        ...[crate1, crate2].map((c) =>
          c.summary[pair[1]] != undefined
            ? ellipseVal(`${c.summary[pair[1]]}`)
            : ""
        ),
      ]);
    }
  });

  const table = asciiTable.default.fromJSON(data);
  table.setAlign(1, asciiTable.AsciiAlign.LEFT);
  table.setAlign(2, asciiTable.AsciiAlign.LEFT);

  console.log(table.toString());
}
