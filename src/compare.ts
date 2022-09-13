import { crate, main, utils } from "./mod.ts";
import { asciiTable, color, datetime } from "./deps.ts";

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
  console.log(`\
Tonkaz ${main.TonkazVersion}

${color.green("Comparing")} these files:

  Crate1: ${color.cyan(crate1.location)}
  Crate2: ${color.cyan(crate2.location)}
`);
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
          return utils.formatDuration(duration);
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
  const trim_prefix_regex = new RegExp(`^outputs/`);

  console.log(`\
${color.green("Comparing")} output files to verify their reproducibility${
    !all
      ? " (using only EDAM-assigned files, option \`--all`\ to compare all files)"
      : ""
  }`);
  console.log(""); // empty line

  const crate1_ids = all
    ? crate1.summary.outputs
    : crate1.summary.outputsWithEdam;
  const crate2_ids = all
    ? crate2.summary.outputs
    : crate2.summary.outputsWithEdam;

  const same_ids = utils.intersection(crate1_ids, crate2_ids);
  const only1_ids = utils.difference(crate1_ids, crate2_ids);
  const only2_ids = utils.difference(crate2_ids, crate1_ids);

  const has_diff_ids = only1_ids.length > 0 || only2_ids.length > 0;
  if (has_diff_ids) {
    renderDiffFiles(only1_ids, only2_ids, trim_prefix_regex);
  }

  if (same_ids.length > 0) {
    compareFileSummary(crate1, crate2, same_ids, trim_prefix_regex);
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

  console.log(`${color.yellow("Found differences")} in output files:`);
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

export function compareFileSummary(
  crate1: crate.Crate,
  crate2: crate.Crate,
  same_ids: string[],
  trim_prefix_regex: RegExp,
): void {
  const summaries = same_ids.map((id) => ({
    id,
    crate1: crate1.findEntity(id).fileSummary(crate1.summary.startTime as Date),
    crate2: crate2.findEntity(id).fileSummary(crate2.summary.startTime as Date),
  }));

  const sameChecksumSummaries = summaries.filter((s) =>
    s.crate1.checksum === s.crate2.checksum
  );
  if (sameChecksumSummaries.length > 0) {
    const ids = sameChecksumSummaries.map((s) => s.id).sort();
    console.log(
      `${color.green("Found identical checksums")} for output files:`,
    );
    console.log(""); // empty line
    console.log(
      ids
        .map((id) => `  - ${id.replace(trim_prefix_regex, "")}`)
        .join("\n"),
    );
    console.log(""); // empty line
  }

  const diffChecksumSummaries = summaries.filter((s) =>
    s.crate1.checksum !== s.crate2.checksum
  );
  if (diffChecksumSummaries.length > 0) {
    console.log(`${color.yellow("Found differences")} in output files:`);
    console.log(""); // empty line
    diffChecksumSummaries.forEach((s) => {
      renderDiffFileSummary(
        crate1,
        crate2,
        s.id,
        s.crate1,
        s.crate2,
        trim_prefix_regex,
      );
    });
  }
}

export function renderDiffFileSummary(
  crate1: crate.Crate,
  crate2: crate.Crate,
  id: string,
  summary1: crate.FileSummary,
  summary2: crate.FileSummary,
  trim_prefix_regex: RegExp,
): void {
  const data: asciiTable.AsciiData = {
    title: "",
    heading: [
      asciiTable.default.alignCenter("", 14, " "),
      asciiTable.default.alignCenter("in Crate1", 19, " "),
      asciiTable.default.alignCenter("in Crate2", 19, " "),
    ],
    rows: [
      [
        "Duration",
        utils.formatDuration(summary1.duration),
        utils.formatDuration(summary2.duration),
      ],
      [
        "Content Size",
        utils.formatFileSize(summary1.contentSize),
        utils.formatFileSize(summary1.contentSize),
      ],
    ],
  };
  if (summary1.lineCount != undefined && summary2.lineCount != undefined) {
    data.rows.push([
      "Line Count",
      summary1.lineCount.toString(),
      summary2.lineCount.toString(),
    ]);
  }

  if (summary1.entity.hasEdam()) {
    const edamUrl = summary1.entity.getEdamUrl() || "";
    if (crate.HAS_ONTOLOGY_EDAM.includes(edamUrl)) {
      if (crate.SAM_EDAM.includes(edamUrl)) {
        const stats1 = summary1.entity.getSamtoolsStats(crate1);
        const stats2 = summary2.entity.getSamtoolsStats(crate2);
        crate.SAM_HEADER_KEYS.forEach(([header, key]) => {
          if (header.includes("#")) {
            // Reads, Rate
            data.rows.push([
              header,
              `${stats1[key + "Reads"]} (${
                (stats1[key + "Rate"] * 100).toFixed(2)
              } %)`,
              `${stats2[key + "Reads"]} (${
                (stats2[key + "Rate"] * 100).toFixed(2)
              } %)`,
            ]);
          } else {
            data.rows.push([
              header,
              `${stats1[key]}`,
              `${stats2[key]}`,
            ]);
          }
        });
      } else if (crate.VCF_EDAM.includes(edamUrl)) {
        const stats1 = summary1.entity.getVcftoolsStats(crate1);
        const stats2 = summary2.entity.getVcftoolsStats(crate2);
        crate.VCF_HEADER_KEYS.forEach(([header, key]) => {
          data.rows.push([
            header,
            stats1[key].toFixed(2).toString(),
            stats2[key].toFixed(2).toString(),
          ]);
        });
      }
    }
  }

  const table = asciiTable.default.fromJSON(data);
  table.setAlign(1, asciiTable.AsciiAlign.LEFT);
  table.setAlign(2, asciiTable.AsciiAlign.LEFT);

  console.log(`  - ${id.replace(trim_prefix_regex, "")}`);
  console.log(
    utils.tablePaddingLeft(addLineUnderGeneralMetadata(table.toString()), 2),
  );
  console.log(""); // empty line
}

export function addLineUnderGeneralMetadata(table: string): string {
  // add line under general metadata (Line Count or Content Size)
  const lines = table.split("\n");
  const line = lines[2];
  const lineCountIndex = lines.findIndex((l) => l.includes("Line Count"));
  const contentSizeIndex = lines.findIndex((l) => l.includes("Content Size"));
  const insertIndex = lineCountIndex > -1 ? lineCountIndex : contentSizeIndex;
  const insertedLines = [
    ...lines.slice(0, insertIndex + 1),
    line,
    ...lines.slice(insertIndex + 1),
  ];
  return insertedLines.join("\n");
}
