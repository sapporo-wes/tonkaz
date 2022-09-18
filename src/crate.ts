import { utils } from "./mod.ts";
import { datetime } from "./deps.ts";

export interface CrateSummary {
  wfName: string;
  wfVersion: string;
  wfId: string;
  wfType: string;
  wfTypeVersion: string;
  sapporoVersion: string;
  wfEngineName: string;
  wfEngineVersion: string;
  testId: string;
  startTime: Date;
  endTime: Date;
  duration: ReturnType<typeof datetime.difference>;
  exitCode: number;
  state: string;
  wfAttachments: string[];
  intermediateFiles: string[];
  outputs: string[];
  outputsWithEdam: string[];
}

export class Crate {
  "location": string;
  "json": utils.Json;
  "entities": Record<string, Entity>;
  "rootdataEntity": Entity;
  "mainWf": Entity;
  "testSuite": Entity;
  "testResult": Entity;
  "testDefinition": Entity;
  "testInstance": Entity;
  "summary": CrateSummary;

  constructor(loc: string) {
    this.location = loc;
  }

  async initialize(): Promise<void> {
    try {
      await this.load();
      const context = this.json["@context"];
      if (context == undefined) {
        throw new Error(`Crate ${this.location} has no @context`);
      }
      const graph = this.json["@graph"];
      if (graph == undefined) {
        throw new Error(`Crate ${this.location} has no @graph`);
      }
      if (!Array.isArray(graph)) {
        throw new Error(`Crate ${this.location} has invalid @graph`);
      }

      this.entities = {};
      graph.map((entity_json) => {
        const entity = new Entity(this, entity_json);
        this.entities[entity.id] = entity;
      });

      this.rootdataEntity = this.findEntity("./");
      this.mainWf = this.getChildEntity(this.rootdataEntity, "mainEntity");
      this.testSuite = this.getChildEntity(this.rootdataEntity, "about");
      this.testResult = this.getChildEntity(this.testSuite, "result");
      this.testDefinition = this.getChildEntity(this.testSuite, "definition");
      this.testInstance = this.getChildEntity(this.testSuite, "instance");
    } catch (e) {
      throw new Error(
        `Failed to initialize crate ${this.location}: ${e.message}`,
      );
    }
  }

  async load(): Promise<void> {
    this.json = await utils.loadJson(this.location);
  }

  findEntity(id: string): Entity {
    const entity = this.entities[id];
    if (entity == undefined) {
      throw new Error(`Entity ${id} not found`);
    }
    return entity;
  }

  getChildEntity(parentEntity: Entity, field: string): Entity {
    const nextIds = parentEntity.flattenIds(field);
    if (nextIds.length !== 1) {
      throw new Error(`Entity ${parentEntity.id} has invalid ${field}`);
    }
    return this.findEntity(nextIds[0]);
  }

  summarize(): void {
    try {
      // General Metadata
      const wfName = `${this.getValRecursively(this.mainWf, ["name"])}`;
      const wfVersion = `${this.getValRecursively(this.mainWf, ["version"])}`;
      const wfId = `${this.getValRecursively(this.mainWf, ["yevisId"])}`;
      const wfType = `${
        this.getValRecursively(this.mainWf, [
          "programmingLanguage",
          "name",
        ])
      }`;
      const wfTypeVersion = `${
        this.getValRecursively(this.mainWf, [
          "programmingLanguage",
          "version",
        ])
      }`;
      const exitCode = this.getValRecursively(this.testResult, [
        "exitCode",
      ]);
      if (typeof exitCode !== "number") {
        throw new Error(`Invalid exit code ${exitCode}`);
      }
      const state = `${this.getValRecursively(this.testResult, ["state"])}`;
      const testId = `${
        this.getValRecursively(this.testDefinition, ["yevisTestId"])
      }`;
      const sapporoVersion = `${
        this.getValRecursively(this.testInstance, ["version"])
      }`;
      const wfEngineName = `${
        this.getValRecursively(this.testDefinition, [
          "conformsTo",
          "name",
        ])
      }`;
      const wfEngineVersion = `${
        this.getValRecursively(this.testDefinition, [
          "conformsTo",
          "version",
        ])
      }`;

      // File IDs
      let wfAttachments: string[] = [];
      try {
        wfAttachments = this.mainWf.flattenIds("attachment");
      } catch (_) {
        // do nothing
      }
      let intermediateFiles: string[] = [];
      try {
        intermediateFiles = this.testResult.flattenIds("intermediateFiles");
      } catch (_) {
        // do nothing
      }
      let outputs: string[] = [];
      try {
        outputs = this.testResult.flattenIds("outputs");
      } catch (_) {
        // do nothing
      }
      const outputsWithEdam = this.filterHasEdam(outputs);

      // Time
      const startTimeStr = `${
        this.getValRecursively(this.testResult, [
          "startTime",
        ])
      }`;
      let startTime: Date;
      try {
        startTime = utils.parseDatetime(startTimeStr);
      } catch (_) {
        throw new Error(`Invalid start time ${startTimeStr}`);
      }
      const endTimeStr = `${
        this.getValRecursively(this.testResult, [
          "endTime",
        ])
      }`;
      let endTime: Date;
      try {
        endTime = utils.parseDatetime(endTimeStr);
      } catch (_) {
        throw new Error(`Invalid end time ${endTimeStr}`);
      }
      const duration = datetime.difference(startTime, endTime);

      const summary: CrateSummary = {
        wfName,
        wfVersion,
        wfId,
        wfType,
        wfTypeVersion,
        sapporoVersion,
        wfEngineName,
        wfEngineVersion,
        testId,
        startTime,
        endTime,
        duration,
        exitCode,
        state,
        wfAttachments,
        intermediateFiles,
        outputs,
        outputsWithEdam,
      };

      this.summary = summary;
    } catch (e) {
      throw new Error(
        `Failed to summarize crate ${this.location}: ${e.message}`,
      );
    }
  }

  getValRecursively(
    entity: Entity,
    fields: string[],
  ): unknown {
    if (fields.length == 0) {
      throw new Error("Fields cannot be empty");
    }
    if (fields.length == 1) {
      return entity.self[fields[0]];
    } else {
      const nextIds = entity.flattenIds(fields[0]);
      if (nextIds.length !== 1) {
        throw new Error(`Entity ${entity.id} has invalid ${fields[0]}`);
      }
      const nextEntity = this.findEntity(nextIds[0]);
      return this.getValRecursively(nextEntity, fields.slice(1));
    }
  }

  filterHasEdam(ids: string[]): string[] {
    return ids.filter((id) => this.findEntity(id).hasEdam());
  }
}

export class Entity {
  "crate": Crate;
  "id": string;
  "type": string | string[];
  "self": utils.Json;
  "fileStats": FileStats | undefined;

  constructor(crate: Crate, json: utils.Json) {
    this.crate = crate;
    const id = json["@id"];
    if (id == undefined) {
      throw new Error(`Entity has no @id`);
    }
    if (typeof id !== "string") {
      throw new Error(`Entity has invalid @id`);
    }
    this.id = id;

    const type = json["@type"];
    if (type == undefined) {
      throw new Error(`Entity has no @type`);
    }
    if (typeof type !== "string" && !Array.isArray(type)) {
      throw new Error(`Entity has invalid @type`);
    }
    this.type = type;

    this.self = json;
    this.fileStats = undefined;
  }

  flattenIds(field: string): string[] {
    // 'field': {"@id": "id_str"}
    // 'field': [{"@id": "id_str"}]
    const val = this.self[field];
    if (val == undefined) {
      throw new Error(`Entity ${this.id} has no ${field}`);
    }

    if (typeof val === "string") {
      return [val];
    } else if (Array.isArray(val)) {
      const ids = val.map((v) => {
        const id = v["@id"];
        if (id == undefined) {
          throw new Error(`Entity ${this.id} has invalid ${field}`);
        }
        if (typeof id !== "string") {
          throw new Error(`Entity ${this.id} has invalid ${field}`);
        }
        return id;
      });
      return ids;
    } else if (typeof val === "object") {
      const val_obj = JSON.parse(JSON.stringify(val));
      const id = val_obj["@id"];
      if (id == undefined) {
        throw new Error(`Entity ${this.id} has invalid ${field}`);
      }
      if (typeof id !== "string") {
        throw new Error(`Entity ${this.id} has invalid ${field}`);
      }
      return [id];
    } else {
      throw new Error(`Entity ${this.id} has invalid ${field}`);
    }
  }

  hasEdam(): boolean {
    return "format" in this.self;
  }

  getEdamUrl(): string | undefined {
    if (!this.hasEdam()) {
      return undefined;
    }
    return this.flattenIds("format")[0];
  }

  getStatId(): string | undefined {
    let statsId: string | undefined = undefined;
    try {
      statsId = this.flattenIds("stats")[0];
    } catch (_) {
      return undefined;
    }
    if (statsId == undefined) {
      return undefined;
    }
    return statsId;
  }

  stats(): FileStats {
    if (this.fileStats != undefined) {
      return this.fileStats;
    }

    const contentSize = this.self["contentSize"];
    if (contentSize == undefined || typeof contentSize !== "number") {
      throw new Error(`Entity ${this.id} has no contentSize`);
    }
    const lineCount = this.self["lineCount"] as number | undefined;
    if (lineCount != undefined && typeof lineCount !== "number") {
      throw new Error(`Entity ${this.id} has invalid lineCount`);
    }
    const checksum = this.self["sha512"] as string;
    if (checksum == undefined) {
      throw new Error(`Entity ${this.id} has no sha512`);
    }

    const dateModified = this.self["dateModified"] as string;
    if (dateModified == undefined) {
      throw new Error(`Entity ${this.id} has no dateModified`);
    }
    const dateModifiedDate = utils.parseDatetime(dateModified);
    const duration = datetime.difference(
      this.crate.summary.startTime,
      dateModifiedDate,
    );

    const fileStats: FileStats = {
      contentSize,
      duration,
      lineCount,
      checksum,
      samtoolsStats: this.getSamtoolsStats(this.crate),
      vcftoolsStats: this.getVcftoolsStats(this.crate),
    };
    this.fileStats = fileStats;

    return fileStats;
  }

  getSamtoolsStats(crate: Crate): SamtoolsStats | undefined {
    if (this.hasEdam()) {
      const edamUrl = this.getEdamUrl();
      if (edamUrl != undefined && SAM_EDAM.includes(edamUrl)) {
        const statsId = this.getStatId();
        if (statsId == undefined) {
          return undefined;
        }
        const statsEntity = crate.findEntity(statsId);

        const keys: Array<keyof SamtoolsStats> = [
          "totalReads",
          "mappedReads",
          "unmappedReads",
          "duplicateReads",
          "mappedRate",
          "unmappedRate",
          "duplicateRate",
        ];
        const stats: SamtoolsStats = {} as SamtoolsStats;
        keys.forEach((key) => {
          const val = statsEntity.self[key];
          if (val == undefined) {
            throw new Error(`Entity ${statsId} has no ${key}`);
          }
          if (typeof val !== "number") {
            throw new Error(`Entity ${statsId} has invalid ${key}`);
          }
          stats[key] = val;
        });

        return stats;
      }
    }

    return undefined;
  }

  getVcftoolsStats(crate: Crate): VcftoolsStats | undefined {
    if (this.hasEdam()) {
      const edamUrl = this.getEdamUrl();
      if (edamUrl != undefined && VCF_EDAM.includes(edamUrl)) {
        const statsId = this.getStatId();
        if (statsId == undefined) {
          return undefined;
        }
        const statsEntity = crate.findEntity(statsId);
        const keys: Array<keyof VcftoolsStats> = [
          "variantCount",
          "snpsCount",
          "indelsCount",
        ];
        const stats: VcftoolsStats = {} as VcftoolsStats;
        keys.forEach((key) => {
          const val = statsEntity.self[key];
          if (val == undefined) {
            throw new Error(`Entity ${statsId} has no ${key}`);
          }
          if (typeof val !== "number") {
            throw new Error(`Entity ${statsId} has invalid ${key}`);
          }
          stats[key] = val;
        });

        return stats;
      }
    }

    return undefined;
  }
}

export interface FileStats {
  contentSize: number;
  duration: ReturnType<typeof datetime.difference>;
  lineCount?: number;
  checksum: string;
  samtoolsStats?: SamtoolsStats;
  vcftoolsStats?: VcftoolsStats;
}

export const EDAM_MAPPING = {
  ".bam": {
    "url": "http://edamontology.org/format_2572",
    "name":
      "BAM format, the binary, BGZF-formatted compressed version of SAM format for alignment of nucleotide sequences (e.g. sequencing reads) to (a) reference sequence(s). May contain base-call and alignment qualities and other data.",
  },
  ".bb": {
    "url": "http://edamontology.org/format_3004",
    "name":
      "bigBed format for large sequence annotation tracks, similar to textual BED format.",
  },
  ".bed": {
    "url": "http://edamontology.org/format_3003",
    "name":
      "Browser Extensible Data (BED) format of sequence annotation track, typically to be displayed in a genome browser.",
  },
  ".bw": {
    "url": "http://edamontology.org/format_3006",
    "name":
      "bigWig format for large sequence annotation tracks that consist of a value for each sequence position. Similar to textual WIG format.",
  },
  ".fa": {
    "url": "http://edamontology.org/format_1929",
    "name": "FASTA format including NCBI-style IDs.",
  },
  ".fasta": {
    "url": "http://edamontology.org/format_1929",
    "name": "FASTA format including NCBI-style IDs.",
  },
  ".fastq": {
    "url": "http://edamontology.org/format_1930",
    "name": "FASTQ short read format ignoring quality scores.",
  },
  ".fastq.gz": {
    "url": "http://edamontology.org/format_1930",
    "name": "FASTQ short read format ignoring quality scores.",
  },
  ".fq": {
    "url": "http://edamontology.org/format_1930",
    "name": "FASTQ short read format ignoring quality scores.",
  },
  ".fq.gz": {
    "url": "http://edamontology.org/format_1930",
    "name": "FASTQ short read format ignoring quality scores.",
  },
  ".gtf": {
    "url": "http://edamontology.org/format_2306",
    "name": "Gene Transfer Format (GTF), a restricted version of GFF.",
  },
  ".gff": {
    "url": "http://edamontology.org/format_1975",
    "name": "Generic Feature Format version 3 (GFF3) of sequence features.",
  },
  ".sam": {
    "url": "http://edamontology.org/format_2573",
    "name":
      "Sequence Alignment/Map (SAM) format for alignment of nucleotide sequences (e.g. sequencing reads) to (a) reference sequence(s). May contain base-call and alignment qualities and other data.",
  },
  ".vcf": {
    "url": "http://edamontology.org/format_3016",
    "name":
      "Variant Call Format (VCF) for sequence variation (indels, polymorphisms, structural variation).",
  },
  ".vcf.gz": {
    "url": "http://edamontology.org/format_3016",
    "name":
      "Variant Call Format (VCF) for sequence variation (indels, polymorphisms, structural variation).",
  },
  ".wig": {
    "url": "http://edamontology.org/format_3005",
    "name":
      "Wiggle format (WIG) of a sequence annotation track that consists of a value for each sequence position. Typically to be displayed in a genome browser.",
  },
};

// .bam, .sam
export const SAM_EDAM = [
  "http://edamontology.org/format_2572",
  "http://edamontology.org/format_2573",
];

// .vcf
export const VCF_EDAM = [
  "http://edamontology.org/format_3016",
];

export const HAS_ONTOLOGY_EDAM = [
  ...SAM_EDAM,
  ...VCF_EDAM,
];

export interface SamtoolsStats {
  totalReads: number;
  mappedReads: number;
  unmappedReads: number;
  duplicateReads: number;
  mappedRate: number;
  unmappedRate: number;
  duplicateRate: number;
}

export const SAM_HEADER_KEYS: [string, keyof SamtoolsStats][] = [
  ["Total Reads", "totalReads"],
  ["  # Mapped", "mappedReads"],
  ["  # Duplicate", "duplicateReads"],
];

export interface VcftoolsStats {
  variantCount: number;
  snpsCount: number;
  indelsCount: number;
}

export const VCF_HEADER_KEYS: [string, keyof VcftoolsStats][] = [
  ["Variant Count", "variantCount"],
  ["SNPs Count", "snpsCount"],
  ["Indels Count", "indelsCount"],
];
