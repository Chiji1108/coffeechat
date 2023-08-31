import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SetSchedulerFunction } from "../functions/set_scheduler/definition.ts";

export const SET_SCHEDULER_WORKFLOW_CALLBACK_ID = "set_scheduler_workflow";

const SetSchedulerWorkflow = DefineWorkflow({
  callback_id: SET_SCHEDULER_WORKFLOW_CALLBACK_ID,
  title: "このチャンネルのスケジューラーを設定する",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["interactivity"],
  },
});

const InputForm = SetSchedulerWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "このチャンネルのスケジューラーを設定する",
    description: "コーヒーチャットのスケジューラーを設定します",
    submit_label: "上書き保存",
    interactivity: SetSchedulerWorkflow.inputs.interactivity,
    fields: {
      elements: [
        // {
        //   name: "coffeechat_channel",
        //   title: "チャンネル",
        //   description:
        //     "このチャンネルに参加している人の中でマッチングが行われます",
        //   type: Schema.slack.types.channel_id,
        // },
        {
          name: "frequency",
          title: "頻度",
          type: Schema.types.integer,
          enum: [1, 2, 3, 4],
          choices: [
            {
              value: 1,
              title: "1週間毎",
            },
            {
              value: 2,
              title: "2週間毎",
            },
            {
              value: 3,
              title: "3週間毎",
            },
            {
              value: 4,
              title: "4週間毎",
            },
          ],
          default: 2,
        },
        {
          name: "start_time",
          title: "最初のマッチング日時",
          description: "最初の曜日と時間を基準に繰り返されます",
          type: Schema.slack.types.timestamp,
          default: Math.floor((Date.now() / 1000) + (60 * 60)),
        },
      ],
      required: [
        // "coffeechat_channel",
        "frequency",
        "start_time",
        // "delete_matching_history",
      ],
    },
  },
);

SetSchedulerWorkflow.addStep(
  SetSchedulerFunction,
  {
    triggered_user: SetSchedulerWorkflow.inputs.user,
    triggered_channel: SetSchedulerWorkflow.inputs.channel,
    frequency: InputForm.outputs.fields.frequency,
    start_time: InputForm.outputs.fields.start_time,
    // delete_matching_history: InputForm.outputs.fields.delete_matching_history,
  },
);

// ConfigureWorkflow.addStep(Schema.slack.functions.SendMessage, {
//   channel_id: ConfigureWorkflow.inputs.channel,
//   message:
//     SaveMatchingTrigger.outputs.error ?
//     `<@${ConfigureWorkflow.inputs.user}>さんがこのチャンネルでコーヒーチャットの設定をしました☕️\n${SaveMatchingTrigger.outputs.message}`,
// });

export default SetSchedulerWorkflow;
