import { Manifest } from "deno-slack-sdk/mod.ts";
import MatchingWorkflow from "./workflows/matching.ts";
import { MatchingResultCustomType } from "./types/matching_result.ts";
import SetSchedulerWorkflow from "./workflows/set_scheduler.ts";
import UnsetSchedulerWorkflow from "./workflows/unset_scheduler.ts";
import { UsersCustomType } from "./types/users.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "Coffee Chat",
  description: "コーヒーチャットアプリ",
  icon: "assets/app_icon.png",
  workflows: [SetSchedulerWorkflow, MatchingWorkflow, UnsetSchedulerWorkflow],
  types: [MatchingResultCustomType, UsersCustomType],
  outgoingDomains: [],
  // datastores: [MatchingHistoryDatastore, TriggerDatastore],
  botScopes: [
    "conversations.connect:manage",
    "channels:read",
    "channels:manage",
    "channels:join",
    "groups:read",
    "groups:write",
    "im:read",
    "im:write",
    "mpim:read",
    "mpim:write",
    "chat:write",
    "chat:write.public",
    // "datastore:read",
    // "datastore:write",
    "triggers:write",
    "triggers:read",
  ],
});
