import React from "react";
import {
  Pane,
  Tablist,
  Tab,
  Paragraph,
  Heading,
  Pre,
  UnorderedList,
  ListItem,
  ClipboardIcon,
  IconButton,
  toaster,
} from "evergreen-ui";
import copy from "copy-to-clipboard";
import { GetShortLinkResponse, ShortLinkWithChildren } from "@shrtlnk/types";
import { ClientContext } from "../client";
import { useHistory, useParams } from "react-router";

interface TabProps {
  shortLink: ShortLinkWithChildren;
}

const TABS = {
  visits: {
    name: "Visits",
    Component: ({ shortLink }: TabProps) => {
      return (
        <>
          {shortLink.visits.map((visit) => (
            <Pre key={visit.id} marginBottom={16}>
              {JSON.stringify(visit, null, 2)}
            </Pre>
          ))}
        </>
      );
    },
  },
  users: {
    name: "Users",
    Component: ({ shortLink }: TabProps) => (
      <UnorderedList>
        {shortLink.visits
          .reduce<number[]>(
            (acc, visit) =>
              acc.includes(visit.visitor.fingerprint)
                ? acc
                : acc.concat([visit.visitor.fingerprint]),
            []
          )
          .map((fingerprint) => (
            <ListItem key={fingerprint}>{fingerprint}</ListItem>
          ))}
      </UnorderedList>
    ),
  },
};

export function RouteShortLink() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { client } = React.useContext(ClientContext);
  const [shortLink, setShortLink] = React.useState<GetShortLinkResponse | null>(
    null
  );
  const [activeTab, setActiveTab] = React.useState<keyof typeof TABS>("visits");

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get<GetShortLinkResponse>(
          `/shortLinks/${id}`
        );
        setShortLink(data);
      } catch (err) {
        history.push("/");
      }
    })();
  }, []);

  return (
    <>
      {shortLink == null ? (
        <Paragraph color="muted">Loading...</Paragraph>
      ) : (
        <>
          <Pane display="flex">
            <Pane flex="1">
              <Heading size={500}>
                {`${window.location.host}/r/${shortLink.id}`}
              </Heading>
              <Paragraph marginBottom={16}>
                Created at {new Date(shortLink.createdAt).toLocaleString()}
              </Paragraph>
            </Pane>
            <Pane>
              <IconButton
                icon={ClipboardIcon}
                onClick={() => {
                  const shortURL = `${window.location.origin}/r/${shortLink.id}`;

                  copy(shortURL);
                  toaster.success(`Short link copied to clipboard`);
                }}
              />
            </Pane>
          </Pane>

          <Tablist marginBottom={16}>
            {Object.entries(TABS).map(([id, tab]) => (
              <Tab
                key={id}
                id={id}
                onSelect={() => setActiveTab(id as keyof typeof TABS)}
                isSelected={activeTab === id}
                aria-controls={`panel-${id}`}
              >
                {tab.name}
              </Tab>
            ))}
          </Tablist>
          {Object.entries(TABS).map(([id, tab]) => (
            <Pane
              key={id}
              id={`panel-${id}`}
              role="tabpanel"
              aria-labelledby={id}
              aria-hidden={activeTab !== id}
              display={activeTab === id ? "block" : "none"}
            >
              <Pane padding={16} background="tint1" flex="1">
                <tab.Component shortLink={shortLink} />
              </Pane>
            </Pane>
          ))}
        </>
      )}
    </>
  );
}
