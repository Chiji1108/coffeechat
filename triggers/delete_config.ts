import { Trigger } from "deno-slack-api/types.ts";

import DeleteConfigWorkflow from "../workflows/delete_config.ts";

const deleteConfigTrigger: Trigger<typeof DeleteConfigWorkflow.definition> = {
  type: "shortcut",
  name: "スケジューラー削除",
  description: "このチャンネルのスケジューラーを削除する",
  workflow: `#/workflows/${DeleteConfigWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: "{{data.channel_id}}",
    },
    user: {
      value: "{{data.user_id}}",
    },
  },
};

export default deleteConfigTrigger;
