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
  connection: process.env.DATABASE_URL,
});

Model.knex(pg);

export class ShortLinkModel extends Model implements ShortLink {
  id!: string;
  url!: string;
  createdAt!: string;

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
  id!: number;
  browser!: string | null;
  engine!: string | null;
  os!: string | null;
  timeZone!: string | null;
  createdAt!: string;
  shortLinkId!: string;
  ipAddress!: string;
  visitorFingerprint!: number;

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
  ip!: string;
  city!: string | null;
  region!: string | null;
  countryName!: string | null;
  continentName!: string | null;
  postal!: string | null;
  asnName!: string | null;
  createdAt!: string;

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
  fingerprint!: number;
  createdAt!: string;

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
