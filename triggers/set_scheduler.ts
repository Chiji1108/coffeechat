import { Trigger } from "deno-slack-api/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import SetSchedulerWorkflow, {
  SET_SCHEDULER_WORKFLOW_CALLBACK_ID,
} from "../workflows/set_scheduler.ts";

const trigger: Trigger<typeof SetSchedulerWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "スケジューラー設定",
  description: "このチャンネルのスケジューラーを設定する",
  workflow: `#/workflows/${SET_SCHEDULER_WORKFLOW_CALLBACK_ID}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default trigger;
