import { utils } from "./mod.ts";
import { datetime } from "./deps.ts";

export class Crate {
  "location": string;
  "json": utils.Json;
  "entities": Entity[];
  "rootdataEntity": Entity;
  "mainWf": Entity;
  "testSuite": Entity;
  "testResult": Entity;
  "testDefinition": Entity;
  "testInstance": Entity;
  "summary": Summary;

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

      this.entities = graph.map((entity_json) => {
        return new Entity(entity_json);
      });

      this.rootdataEntity = this.findEntity("./");
      this.mainWf = this.getEntity(this.rootdataEntity, "mainEntity");
      this.testSuite = this.getEntity(this.rootdataEntity, "about");
      this.testResult = this.getEntity(this.testSuite, "result");
      this.testDefinition = this.getEntity(this.testSuite, "definition");
      this.testInstance = this.getEntity(this.testSuite, "instance");
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
    const entity = this.entities.find((entity) => entity.id === id);
    if (entity == undefined) {
      throw new Error(`Entity ${id} not found in crate ${this.location}`);
    }
    return entity;
  }

  getEntity(parentEntity: Entity, field: string): Entity {
    const nextIds = parentEntity.flattenIds(field);
    if (nextIds.length !== 1) {
      throw new Error(`Entity ${parentEntity.id} has invalid ${field}`);
    }
    return this.findEntity(nextIds[0]);
  }

  summarize(): void {
    const wfName = this.getValRecursively(this.mainWf, ["name"]);
    const wfVersion = this.getValRecursively(this.mainWf, ["version"]);
    const wfId = this.getValRecursively(this.mainWf, ["yevisId"]);
    const wfType = this.getValRecursively(this.mainWf, [
      "programmingLanguage",
      "name",
    ]);
    const wfTypeVersion = this.getValRecursively(this.mainWf, [
      "programmingLanguage",
      "version",
    ]);
    const wfAttachments = this.mainWf.flattenIds("attachment");

    const startTime = this.getValRecursively(this.testResult, [
      "startTime",
    ]);
    const dateStartTime = typeof startTime === "string"
      ? datetime.parse(startTime, "yyyy-MM-dd'T'HH:mm:ss")
      : undefined;
    const endTime = this.getValRecursively(this.testResult, [
      "endTime",
    ]);
    const dateEndTime = typeof endTime === "string"
      ? datetime.parse(endTime, "yyyy-MM-dd'T'HH:mm:ss")
      : undefined;
    let duration = undefined;
    if (dateStartTime != undefined && dateEndTime != undefined) {
      duration = datetime.difference(dateStartTime, dateEndTime);
    }

    const exitCode = this.getValRecursively(this.testResult, [
      "exitCode",
    ]);
    const state = this.getValRecursively(this.testResult, ["state"]);
    const intermediateFiles = this.testResult.flattenIds("intermediateFiles");
    const outputs = this.testResult.flattenIds("outputs");

    const testId = this.getValRecursively(this.testDefinition, ["yevisTestId"]);

    const summary: Summary = {
      "wfName": typeof wfName === "string" ? wfName : undefined,
      "wfVersion": typeof wfVersion === "string" ? wfVersion : undefined,
      "wfId": typeof wfId === "string" ? wfId : undefined,
      "wfType": typeof wfType === "string" ? wfType : undefined,
      "wfTypeVersion": typeof wfTypeVersion === "string"
        ? wfTypeVersion
        : undefined,
      "testId": typeof testId === "string" ? testId : undefined,
      "startTime": dateStartTime,
      "endTime": dateEndTime,
      "duration": duration,
      "exitCode": typeof exitCode === "number" ? exitCode : undefined,
      "state": typeof state === "string" ? state : undefined,
      "wfAttachments": wfAttachments,
      "intermediateFiles": intermediateFiles,
      "outputs": outputs,
    };

    this.summary = summary;
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
}

export class Entity {
  "id": string;
  "type": string | string[];
  "self": utils.Json;

  constructor(json: utils.Json) {
    const id = json["@id"];
    if (id == undefined) {
      throw new Error(`Entity has no @id`);
    }
    if (typeof id !== "string") {
      throw new Error(`Entity has invalid @id`);
    }
    this["id"] = id;

    const type = json["@type"];
    if (type == undefined) {
      throw new Error(`Entity has no @type`);
    }
    if (typeof type !== "string" && !Array.isArray(type)) {
      throw new Error(`Entity has invalid @type`);
    }
    this["type"] = type;

    this["self"] = json;
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
}

export interface Summary {
  wfName?: string;
  wfVersion?: string;
  wfId?: string;
  wfType?: string;
  wfTypeVersion?: string;
  testId?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: ReturnType<typeof datetime.difference>;
  exitCode?: number;
  state?: string;
  wfAttachments: string[];
  intermediateFiles: string[];
  outputs: string[];
}
