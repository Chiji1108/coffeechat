import { Manifest } from "deno-slack-sdk/mod.ts";
import MatchingHistoryDatastore from "./datastores/matching_history.ts";
import ConfigureWorkflow from "./workflows/configure.ts";
import MatchingWorkflow from "./workflows/matching.ts";
import TriggerDatastore from "./datastores/trigger.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "Coffee Chat",
  description: "コーヒーチャットアプリ",
  icon: "assets/app_icon.png",
  workflows: [ConfigureWorkflow, MatchingWorkflow],
  outgoingDomains: [],
  datastores: [MatchingHistoryDatastore, TriggerDatastore],
  botScopes: [
    "channels:read",
    "channels:manage",
    "groups:read",
    "groups:write",
    "im:read",
    "im:write",
    "mpim:read",
    "mpim:write",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "triggers:write",
    "triggers:read",
  ],
});
