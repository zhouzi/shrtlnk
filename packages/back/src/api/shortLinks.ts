import express from "express";
import IPData from "ipdata";
import {
  GetShortLinksParameters,
  GetShortLinksResponse,
  PostShortLinksParameters,
  PostShortLinksResponse,
  PostShortLinksBody,
  PostShortLinksVisitsParameters,
  PostShortLinksVisitsResponse,
  PostShortLinksVisitsBody,
  GetShortLinkParameters,
  GetShortLinkResponse,
} from "@shrtlnk/types";
import { database, generateID } from "../database";
import { authorization } from "../authorization";

const ipdata = new IPData(process.env.IPDATA_API_KEY!);
export const shortLinksRouter = express.Router();

shortLinksRouter.get<GetShortLinksParameters, GetShortLinksResponse>(
  "/shortLinks",
  authorization,
  (req, res) => {
    res.json(
      database.shortLinks.map((shortLink) => ({
        ...shortLink,
        visits: shortLink.visits.map((visitID) => {
          const visit = database.shortLinksVisits.find(
            (visit) => visit.id === visitID
          )!;
          const ip = database.shortLinksVisitsIPs.find(
            (visitIP) => visitIP.ip === visit.ip
          )!;
          const visitor = database.shortLinksVisitors.find(
            (visitor) => visitor.fingerprint === visit.visitor
          )!;

          return {
            ...visit,
            ip,
            visitor,
          };
        }),
      }))
    );
  }
);

shortLinksRouter.post<
  PostShortLinksParameters,
  PostShortLinksResponse,
  PostShortLinksBody
>("/shortLinks", authorization, (req, res) => {
  // FIXME: validate input
  const { url } = req.body;
  const shortLink = {
    id: generateID(),
    url,
    visits: [],
    createdAt: new Date().toISOString(),
  };

  database.shortLinks.push(shortLink);

  res.json(shortLink);
});

shortLinksRouter.post<
  PostShortLinksVisitsParameters,
  PostShortLinksVisitsResponse,
  PostShortLinksVisitsBody
>("/shortLinks/:id/visits", async (req, res) => {
  // FIXME: validate input
  const { fingerprint, browser, engine, os, timeZone } = req.body;
  const shortLink = database.shortLinks.find(
    (shortLink) => shortLink.id === req.params.id
  );

  if (shortLink == null) {
    return res.status(404).end();
  }

  if (
    database.shortLinksVisitsIPs.find((visitIP) => visitIP.ip === req.ip) ==
    null
  ) {
    const {
      city,
      region,
      country_name: countryName,
      continent_name: continentName,
      postal,
      asn,
    } = req.ip.includes("127.0.0.1")
      ? {
          city: null,
          region: null,
          country_name: null,
          continent_name: null,
          postal: null,
          asn: null,
        }
      : await ipdata.lookup();

    database.shortLinksVisitsIPs.push({
      ip: req.ip,
      city: city ?? null,
      region: region ?? null,
      countryName: countryName ?? null,
      continentName: continentName ?? null,
      postal: postal ?? null,
      asnName: asn?.name ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  if (
    database.shortLinksVisitors.find(
      (visitor) => visitor.fingerprint === fingerprint
    ) == null
  ) {
    database.shortLinksVisitors.push({
      fingerprint,
      createdAt: new Date().toISOString(),
    });
  }

  const shortLinkVisit = {
    id: database.shortLinksVisits.length + 1,
    browser,
    engine,
    os,
    timeZone,
    createdAt: new Date().toISOString(),
    ip: req.ip,
    visitor: fingerprint,
  };
  database.shortLinksVisits.push(shortLinkVisit);

  shortLink.visits.push(shortLinkVisit.id);

  const { visits, ...rest } = shortLink;
  res.json(rest);
});

shortLinksRouter.get<GetShortLinkParameters, GetShortLinkResponse>(
  "/shortLinks/:id",
  authorization,
  (req, res) => {
    const shortLink = database.shortLinks.find(
      (shortLink) => shortLink.id === req.params.id
    );

    if (shortLink == null) {
      res.status(404).end();
      return;
    }

    res.json({
      ...shortLink,
      visits: shortLink.visits.map((visitID) => {
        const visit = database.shortLinksVisits.find(
          (visit) => visit.id === visitID
        )!;
        const ip = database.shortLinksVisitsIPs.find(
          (visitIP) => visitIP.ip === visit.ip
        )!;
        const visitor = database.shortLinksVisitors.find(
          (visitor) => visitor.fingerprint === visit.visitor
        )!;

        return {
          ...visit,
          ip,
          visitor,
        };
      }),
    });
  }
);
