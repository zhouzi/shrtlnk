import React from "react";
import { useParams } from "react-router";
import "clientjs";
import {
  PostShortLinksVisitsBody,
  PostShortLinksVisitsResponse,
} from "@shrtlnk/types";
import { ClientContext } from "../client";

export function RouteRedirect() {
  const { client } = React.useContext(ClientContext);
  const { id } = useParams<{ id: string }>();

  React.useEffect(() => {
    (async () => {
      // @ts-ignore
      const fp = new ClientJS();
      const fingerprint = fp.getFingerprint();

      const body: PostShortLinksVisitsBody = {
        fingerprint,
        browser: `${fp.getBrowser()} ${fp.getBrowserVersion()}`,
        engine: `${fp.getEngine()} ${fp.getEngineVersion()}`,
        os: `${fp.getOS()} ${fp.getOSVersion()}`,
        timeZone: fp.getTimeZone(),
      };
      const {
        data: { url },
      } = await client.post<PostShortLinksVisitsResponse>(
        `/shortLinks/${id}/visits`,
        body
      );
      window.location.href = url;
    })();
  }, [id]);

  return null;
}
