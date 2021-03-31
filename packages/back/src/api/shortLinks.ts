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
import {
  ShortLinkModel,
  generateID,
  ShortLinkVisitIPModel,
  ShortLinkVisitorModel,
  ShortLinkVisitModel,
} from "../database";
import { authorization } from "../authorization";

const ipdata = new IPData(process.env.IPDATA_API_KEY!);
export const shortLinksRouter = express.Router();

shortLinksRouter.get<GetShortLinksParameters, GetShortLinksResponse>(
  "/shortLinks",
  authorization,
  async (req, res) => {
    const shortLinks = ((await ShortLinkModel.query().withGraphFetched(
      "visits.[ip, visitor]"
    )) as unknown) as GetShortLinksResponse;
    res.json(shortLinks);
  }
);

shortLinksRouter.post<
  PostShortLinksParameters,
  PostShortLinksResponse,
  PostShortLinksBody
>("/shortLinks", authorization, async (req, res) => {
  // FIXME: validate input
  const { url } = req.body;

  const shortLink = await ShortLinkModel.query().insertAndFetch({
    id: generateID(),
    url,
    createdAt: new Date().toISOString(),
  });

  res.json(shortLink as any);
});

shortLinksRouter.post<
  PostShortLinksVisitsParameters,
  PostShortLinksVisitsResponse,
  PostShortLinksVisitsBody
>("/shortLinks/:id/visits", async (req, res) => {
  // FIXME: validate input
  const { fingerprint, browser, engine, os, timeZone } = req.body;

  const forwardedFor = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || req.ip;

  const shortLink = await ShortLinkModel.query().findById(req.params.id);
  if (shortLink == null) {
    return res.status(404).end();
  }

  const visitIP = await ShortLinkVisitIPModel.query().findById(ip);
  if (visitIP == null) {
    const {
      city,
      region,
      country_name: countryName,
      continent_name: continentName,
      postal,
      asn,
    } = ip.includes("127.0.0.1")
      ? {
          city: null,
          region: null,
          country_name: null,
          continent_name: null,
          postal: null,
          asn: null,
        }
      : await ipdata.lookup(ip);

    await ShortLinkVisitIPModel.query().insert({
      ip,
      city: city ?? null,
      region: region ?? null,
      countryName: countryName ?? null,
      continentName: continentName ?? null,
      postal: postal ?? null,
      asnName: asn?.name ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  const visitor = await ShortLinkVisitorModel.query().findById(fingerprint);
  if (visitor == null) {
    await ShortLinkVisitorModel.query().insert({
      fingerprint,
      createdAt: new Date().toISOString(),
    });
  }

  await ShortLinkVisitModel.query().insert({
    browser,
    engine,
    os,
    timeZone,
    createdAt: new Date().toISOString(),
    shortLinkId: shortLink.id,
    ipAddress: ip,
    visitorFingerprint: fingerprint,
  });

  res.json(shortLink);
});

shortLinksRouter.get<GetShortLinkParameters, GetShortLinkResponse>(
  "/shortLinks/:id",
  authorization,
  async (req, res) => {
    const shortLink = ((await ShortLinkModel.query()
      .findById(req.params.id)
      .withGraphFetched(
        "visits.[ip, visitor]"
      )) as unknown) as GetShortLinkResponse;

    if (shortLink == null) {
      res.status(404).end();
      return;
    }

    res.json(shortLink);
  }
);
