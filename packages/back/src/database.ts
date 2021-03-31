import { customAlphabet } from "nanoid";
import {
  ShortLink,
  ShortLinkVisit,
  ShortLinkVisitor,
  ShortLinkVisitIP,
} from "@shrtlnk/types";

export function generateID() {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 16);

  return nanoid();
}

interface ShortLinkModel extends ShortLink {
  visits: number[];
}

interface ShortLinkVisitModel extends ShortLinkVisit {
  ip: string;
  visitor: number;
}

interface ShortLinkVisitorModel extends ShortLinkVisitor {}

interface ShortLinkVisitIPModel extends ShortLinkVisitIP {}

export const database = {
  shortLinks: [] as ShortLinkModel[],
  shortLinksVisits: [] as ShortLinkVisitModel[],
  shortLinksVisitors: [] as ShortLinkVisitorModel[],
  shortLinksVisitsIPs: [] as ShortLinkVisitIPModel[],
};
