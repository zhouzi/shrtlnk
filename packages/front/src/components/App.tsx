import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import axios, { AxiosInstance } from "axios";
import { Button, Pane, TextInputField } from "evergreen-ui";
import { RouteHome, RouteRedirect, RouteShortLink } from "../routes";
import { ClientContext } from "../client";
import { Header } from "./Header";

export function App() {
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState<Error | null>(null);
  const [clientContext, setClientContext] = React.useState<{
    client: AxiosInstance | null;
  }>({
    client: null,
  });

  return (
    <BrowserRouter>
      <Pane padding={16} maxWidth="40rem" marginX="auto">
        <Switch>
          <Route path="/r/:id">
            <RouteRedirect />
          </Route>
          <Route>
            {clientContext.client ? (
              <ClientContext.Provider
                value={clientContext as { client: AxiosInstance }}
              >
                <>
                  <Header />
                  <Switch>
                    <Route path="/" exact>
                      <RouteHome />
                    </Route>
                    <Route path="/shortLinks/:id">
                      <RouteShortLink />
                    </Route>
                    <Redirect to="/" />
                  </Switch>
                </>
              </ClientContext.Provider>
            ) : (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();

                  try {
                    const authorization = `Bearer ${input}`;
                    const newClient = axios.create({
                      baseURL: "/api",
                      headers: {
                        authorization,
                      },
                    });
                    await newClient.get("/shortLinks");

                    setClientContext({ client: newClient });
                  } catch (err) {
                    setError(new Error("Invalid passphrase."));
                  }
                }}
              >
                <Pane padding={16} background="tint2" borderRadius={3}>
                  <TextInputField
                    label="Passphrase"
                    value={input}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setInput(event.target.value);
                      setError(null);
                    }}
                    required
                    validationMessage={error?.message}
                  />
                  <Button type="submit" appearance="primary">
                    Submit
                  </Button>
                </Pane>
              </form>
            )}
          </Route>
        </Switch>
      </Pane>
    </BrowserRouter>
  );
}
