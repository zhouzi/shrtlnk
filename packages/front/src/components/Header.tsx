import React from "react";
import { Link } from "react-router-dom";
import {
  Pane,
  Heading,
  Button,
  PlusIcon,
  Dialog,
  TextInputField,
} from "evergreen-ui";
import { PostShortLinksResponse } from "@shrtlnk/types";
import { ClientContext } from "../client";

export function Header() {
  const { client } = React.useContext(ClientContext);
  const [isCreating, setIsCreating] = React.useState(false);
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    if (!isCreating) {
      setUrl("");
    }
  }, [isCreating]);

  return (
    <Pane
      display="flex"
      padding={16}
      background="tint2"
      borderRadius={3}
      marginBottom={16}
    >
      <Pane flex={1} alignItems="center" display="flex">
        <Heading size={600}>
          <Link to="/">shrtlnk</Link>
        </Heading>
      </Pane>
      <Pane>
        <Button
          appearance="primary"
          iconAfter={PlusIcon}
          onClick={() => setIsCreating(true)}
        >
          Create
        </Button>
        <Dialog
          isShown={isCreating}
          title="Create a new link"
          onCloseComplete={() => setIsCreating(false)}
          hasFooter={false}
          contentContainerProps={{ padding: 0 }}
        >
          {({ close }) => (
            <form
              onSubmit={async (event) => {
                event.preventDefault();

                const { data } = await client.post<PostShortLinksResponse>(
                  "/shortLinks",
                  {
                    url,
                  }
                );

                // setShortLinks((currentShortLinks) =>
                //   currentShortLinks.concat([data])
                // );
                close();
              }}
            >
              <Pane padding={16}>
                <TextInputField
                  type="url"
                  required
                  label="Link URL"
                  placeholder="https://google.com"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setUrl(event.target.value)
                  }
                  value={url}
                />
              </Pane>
              <Pane borderTop="muted" clearfix>
                <Pane padding={16} float="right">
                  <Button type="button" onClick={close}>
                    Cancel
                  </Button>
                  <Button type="submit" marginLeft={8} appearance="primary">
                    Create
                  </Button>
                </Pane>
              </Pane>
            </form>
          )}
        </Dialog>
      </Pane>
    </Pane>
  );
}
