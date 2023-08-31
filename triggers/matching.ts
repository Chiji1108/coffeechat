import { Trigger } from "deno-slack-api/types.ts";

import MatchingWorkflow, {
  MATCHING_WORKFLOW_CALLBACK_ID,
} from "../workflows/matching.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

const trigger: Trigger<typeof MatchingWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "1回だけマッチング",
  description: "このチャンネルで一回限りのマッチングをする",
  workflow: `#/workflows/${MATCHING_WORKFLOW_CALLBACK_ID}`,
  inputs: {
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default trigger;
