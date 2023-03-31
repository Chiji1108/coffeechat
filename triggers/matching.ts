import { Trigger } from "deno-slack-api/types.ts";

import MatchingWorkflow from "../workflows/matching.ts";

const matchingTrigger: Trigger<typeof MatchingWorkflow.definition> = {
  type: "shortcut",
  name: "1回だけマッチング",
  description: "このチャンネルで一回限りのマッチングをする",
  workflow: `#/workflows/${MatchingWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default matchingTrigger;
