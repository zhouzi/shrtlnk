import { RequestHandler } from "express";

export const authorization: RequestHandler<unknown> = (req, res, next) => {
  const authorization = req.headers.authorization ?? "";

  const regexp = /Bearer (.+)/;
  const passphrase = regexp.test(authorization)
    ? authorization.match(regexp)![1]
    : "";

  if (passphrase === process.env.PASSPHRASE) {
    return next();
  }

  res.status(401).end();
};
