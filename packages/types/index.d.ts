export interface ShortLink {
  id: string;
  url: string;
  createdAt: string;
}

export interface ShortLinkWithChildren extends ShortLink {
  visits: ShortLinkVisitWithChildren[];
}

export interface ShortLinkVisit {
  id: number;
  browser: string;
  engine: string;
  os: string;
  timeZone: string;
  createdAt: string;
}

export interface ShortLinkVisitWithChildren extends ShortLinkVisit {
  ip: ShortLinkVisitIP;
  visitor: ShortLinkVisitor;
}

export interface ShortLinkVisitor {
  fingerprint: number;
  createdAt: string;
}

export interface ShortLinkVisitIP {
  ip: string;
  city: string | null;
  region: string | null;
  countryName: string | null;
  continentName: string | null;
  postal: string | null;
  asnName: string | null;
  createdAt: string;
}

export interface GetShortLinksParameters {}

export type GetShortLinksResponse = ShortLinkWithChildren[];

export interface PostShortLinksParameters {}

export type PostShortLinksResponse = ShortLinkWithChildren;

export interface PostShortLinksBody {
  url: string;
}

export interface PostShortLinksVisitsParameters {
  id: string;
}

export type PostShortLinksVisitsResponse = ShortLink;

export interface PostShortLinksVisitsBody {
  fingerprint: number;
  browser: string;
  engine: string;
  os: string;
  timeZone: string;
}

export interface GetShortLinkParameters {
  id: string;
}

export type GetShortLinkResponse = ShortLinkWithChildren;
