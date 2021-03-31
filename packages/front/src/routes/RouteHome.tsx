import React from "react";
import { useHistory } from "react-router-dom";
import {
  Table,
  IconButton,
  ClipboardIcon,
  EyeOpenIcon,
  toaster,
} from "evergreen-ui";
import copy from "copy-to-clipboard";
import { GetShortLinksResponse } from "@shrtlnk/types";
import { ClientContext } from "../client";

export function RouteHome() {
  const { client } = React.useContext(ClientContext);
  const [shortLinks, setShortLinks] = React.useState<GetShortLinksResponse>([]);
  const history = useHistory();

  React.useEffect(() => {
    (async () => {
      const { data } = await client.get<GetShortLinksResponse>("/shortLinks");
      setShortLinks(data);
    })();
  }, []);

  return (
    <Table>
      <Table.Head>
        <Table.TextHeaderCell>Short Link</Table.TextHeaderCell>
        <Table.TextHeaderCell>URL</Table.TextHeaderCell>
        <Table.TextHeaderCell>Visits</Table.TextHeaderCell>
        <Table.TextHeaderCell>Users</Table.TextHeaderCell>
        <Table.HeaderCell />
      </Table.Head>
      <Table.Body>
        {shortLinks.map((shortLink) => (
          <Table.Row key={shortLink.id}>
            <Table.TextCell>{`${window.location.host}/r/${shortLink.id}`}</Table.TextCell>
            <Table.TextCell>{shortLink.url}</Table.TextCell>
            <Table.TextCell isNumber>{shortLink.visits.length}</Table.TextCell>
            <Table.TextCell isNumber>
              {
                shortLink.visits.reduce<number[]>(
                  (acc, visit) =>
                    acc.includes(visit.visitor.fingerprint)
                      ? acc
                      : acc.concat([visit.visitor.fingerprint]),
                  []
                ).length
              }
            </Table.TextCell>
            <Table.Cell justifyContent="flex-end">
              <IconButton
                icon={ClipboardIcon}
                onClick={() => {
                  const shortURL = `${window.location.origin}/r/${shortLink.id}`;

                  copy(shortURL);
                  toaster.success(`Short link copied to clipboard`);
                }}
                marginRight={8}
              />
              <IconButton
                icon={EyeOpenIcon}
                onClick={() => {
                  history.push(`/shortLinks/${shortLink.id}`);
                }}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
