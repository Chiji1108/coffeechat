import { Trigger } from "deno-slack-api/types.ts";

import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import UnsetSchedulerWorkflow, {
  UNSET_SCHEDULER_WORKFLOW_CALLBACK_ID,
} from "../workflows/unset_scheduler.ts";

const trigger: Trigger<typeof UnsetSchedulerWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "スケジューラー削除",
  description: "このチャンネルのスケジューラーを削除する",
  workflow: `#/workflows/${UNSET_SCHEDULER_WORKFLOW_CALLBACK_ID}`,
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
