import { Trigger } from "deno-slack-api/types.ts";

import ConfigureWorkflow from "../workflows/configure.ts";

const configureTrigger: Trigger<typeof ConfigureWorkflow.definition> = {
  type: "shortcut",
  name: "スケジューラー設定",
  description: "このチャンネルのスケジューラーを設定する",
  workflow: `#/workflows/${ConfigureWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
    user: {
      value: "{{data.user_id}}",
    },
  },
};

export default configureTrigger;
