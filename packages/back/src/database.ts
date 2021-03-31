import { customAlphabet } from "nanoid";
import Knex from "knex";
import { Model } from "objection";
import {
  ShortLink,
  ShortLinkVisit,
  ShortLinkVisitor,
  ShortLinkVisitIP,
} from "@shrtlnk/types";

const pg = Knex({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});

Model.knex(pg);

export class ShortLinkModel extends Model implements ShortLink {
  id = "";
  url = "";
  createdAt = new Date().toISOString();

  static get tableName() {
    return "shortLinks";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    return {
      visits: {
        relation: Model.HasManyRelation,
        modelClass: ShortLinkVisitModel,
        join: {
          from: `${ShortLinkModel.tableName}.id`,
          to: `${ShortLinkVisitModel.tableName}.shortLinkId`,
        },
      },
    };
  }
}

export class ShortLinkVisitModel extends Model implements ShortLinkVisit {
  id = 0;
  browser = null;
  engine = null;
  os = null;
  timeZone = null;
  createdAt = new Date().toISOString();
  shortLinkId: string = "";
  ipAddress: string = "";
  visitorFingerprint: number = 0;

  static get tableName() {
    return "visits";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    return {
      shortLink: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShortLinkModel,
        join: {
          from: `${ShortLinkVisitModel.tableName}.shortLinkid`,
          to: `${ShortLinkModel.tableName}.id`,
        },
      },
      ip: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShortLinkVisitIPModel,
        join: {
          from: `${ShortLinkVisitModel.tableName}.ipAddress`,
          to: `${ShortLinkVisitIPModel.tableName}.ip`,
        },
      },
      visitor: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShortLinkVisitorModel,
        join: {
          from: `${ShortLinkVisitModel.tableName}.visitorFingerprint`,
          to: `${ShortLinkVisitorModel.tableName}.fingerprint`,
        },
      },
    };
  }
}

export class ShortLinkVisitIPModel extends Model implements ShortLinkVisitIP {
  ip = "";
  city = null;
  region = null;
  countryName = null;
  continentName = null;
  postal = null;
  asnName = null;
  createdAt = new Date().toISOString();

  static get tableName() {
    return "ips";
  }

  static get idColumn() {
    return "ip";
  }

  static get relationMappings() {
    return {
      visits: {
        relation: Model.HasManyRelation,
        modelClass: ShortLinkVisitModel,
        join: {
          from: `${ShortLinkVisitIPModel.tableName}.ip`,
          to: `${ShortLinkVisitModel.tableName}.ip`,
        },
      },
    };
  }
}

export class ShortLinkVisitorModel extends Model implements ShortLinkVisitor {
  fingerprint = 0;
  createdAt = new Date().toISOString();

  static get tableName() {
    return "visitors";
  }

  static get idColumn() {
    return "fingerprint";
  }

  static get relationMappings() {
    return {
      visits: {
        relation: Model.HasManyRelation,
        modelClass: ShortLinkVisitModel,
        join: {
          from: `${ShortLinkVisitorModel.tableName}.fingerprint`,
          to: `${ShortLinkVisitModel.tableName}.visitorFingerprint`,
        },
      },
    };
  }
}

export async function createSchema() {
  if (!(await pg.schema.hasTable(ShortLinkModel.tableName))) {
    await pg.schema.createTable(ShortLinkModel.tableName, (table) => {
      table.string("id").notNullable().unique().primary();
      table.text("url").notNullable();
      table.dateTime("createdAt").notNullable();
    });
  }

  if (!(await pg.schema.hasTable(ShortLinkVisitIPModel.tableName))) {
    await pg.schema.createTable(ShortLinkVisitIPModel.tableName, (table) => {
      table.string("ip").notNullable().unique().primary();
      table.string("city");
      table.string("region");
      table.string("countryName");
      table.string("continentName");
      table.string("postal");
      table.string("asnName");
      table.dateTime("createdAt").notNullable();
    });
  }

  if (!(await pg.schema.hasTable(ShortLinkVisitorModel.tableName))) {
    await pg.schema.createTable(ShortLinkVisitorModel.tableName, (table) => {
      table.bigInteger("fingerprint").notNullable().unique().primary();
      table.dateTime("createdAt").notNullable();
    });
  }

  if (!(await pg.schema.hasTable(ShortLinkVisitModel.tableName))) {
    await pg.schema.createTable(ShortLinkVisitModel.tableName, (table) => {
      table.increments("id").notNullable().unique().primary();
      table.string("browser");
      table.string("engine");
      table.string("os");
      table.string("timeZone");
      table.dateTime("createdAt").notNullable();

      table.string("shortLinkId").notNullable();
      table.foreign("shortLinkId").references(`${ShortLinkModel.tableName}.id`);

      table.string("ipAddress").notNullable();
      table
        .foreign("ipAddress")
        .references(`${ShortLinkVisitIPModel.tableName}.ip`);

      table.bigInteger("visitorFingerprint").notNullable();
      table
        .foreign("visitorFingerprint")
        .references(`${ShortLinkVisitorModel.tableName}.fingerprint`);
    });
  }
}

export function generateID() {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 16);

  return nanoid();
}
