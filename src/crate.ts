import { utils } from "./mod.ts";

export class Crate {
  "location": string;
  "json": utils.Json;
  "entities": Entity[];
  "rootdataEntity": Entity;
  "mainWf": Entity;
  "testSuite": Entity;

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
      const mainWfId = this.rootdataEntity.flattenFieldVal("mainEntity")[0];
      this.mainWf = this.findEntity(mainWfId);
      const testSuiteId = this.rootdataEntity.flattenFieldVal("about")[0];
      this.testSuite = this.findEntity(testSuiteId);
    } catch (e) {
      throw new Error(
        `Failed to initialize crate ${this.location}: ${e.message}`,
      );
    }
  }

  async load(): Promise<void> {
    this.json = await utils.load_json(this.location);
  }

  findEntity(id: string): Entity {
    const entity = this.entities.find((entity) => entity.id === id);
    if (entity == undefined) {
      throw new Error(`Entity ${id} not found in crate ${this.location}`);
    }
    return entity;
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

  flattenFieldVal(field: string): string[] {
    // 'field': "id_str"
    // 'field': ["id_str"]
    // 'field': {"@id": "id_str"}
    // 'field': [{"@id": "id_str"}]
    const val = this.self[field];
    if (val == undefined) {
      throw new Error(`Entity ${this.id} has no ${field}`);
    }

    if (typeof val === "string") {
      return [val];
    } else if (Array.isArray(val)) {
      return val.map((v) => {
        if (typeof v === "string") {
          return v;
        } else if (typeof v === "object") {
          const id = v["@id"];
          if (id == undefined) {
            throw new Error(`Entity ${this.id} has invalid ${field}`);
          }
          return id;
        } else {
          throw new Error(`Entity ${this.id} has invalid ${field}`);
        }
      });
    } else if (typeof val === "object") {
      const obj = JSON.parse(JSON.stringify(val));
      const id = obj["@id"];
      if (id == undefined) {
        throw new Error(`Entity ${this.id} has invalid ${field}`);
      }
      return [id];
    } else {
      throw new Error(`Entity ${this.id} has invalid ${field}`);
    }
  }
}
