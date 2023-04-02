import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { MatchingResultCustomType } from "../types/matching_result.ts";

export const SendResultFunction = DefineFunction({
  callback_id: "send_result_function",
  title: "Send Result Function",
  source_file: "functions/send_result.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      matching_result: {
        type: MatchingResultCustomType,
      },
    },
    required: ["channel", "matching_result"],
  },
});

export default SlackFunction(SendResultFunction, async ({ inputs, client }) => {
  const { channel, matching_result: { matched_groups, unmatched_users } } =
    inputs;

  if (!matched_groups || !unmatched_users) {
    return {
      error: `matched_groups or unmatched_users is undefined`,
    };
  }

  const joinResponse = await client.conversations.join({ channel });
  if (!joinResponse.ok) {
    return { error: `Failed to join the channel: ${joinResponse.error}` };
  }

  const sendToMatchedGroup = async (users: string[]) => {
    console.log("users", users);
    const convOpenResponse = await client.conversations.open({
      users: users.join(),
    });
    if (!convOpenResponse.ok) {
      throw new Error(
        `Failed to open conversation for ${users}: ${convOpenResponse.error}`,
      );
    }
    const postMessageResponse = await client.chat.postMessage({
      channel: convOpenResponse.channel.id,
      text: `${
        users.map((u) => (`<@${u}>さん`)).join()
      }こんにちは👋\n<#${channel}>のコーヒーチャットの時間です🎉\n2人の予定を合わせて楽しいコーヒーチャットを☕️`,
    });
    if (!postMessageResponse.ok) {
      throw new Error(`Failed to send message: ${postMessageResponse.error}`);
    }
  };

  const sendToUnmachedUser = async (user: string) => {
    const convOpenResponse = await client.conversations.open({
      users: user,
    });
    if (!convOpenResponse.ok) {
      throw new Error(
        `Failed to open conversation for ${user}: ${convOpenResponse.error}`,
      );
    }
    const postMessageResponse = await client.chat.postMessage({
      channel: convOpenResponse.channel.id,
      text:
        `<#${channel}>のコーヒーチャットはマッチング運により今回お休みです☕️\n次回をお楽しみに👋`,
    });
    if (!postMessageResponse.ok) {
      throw new Error(`Failed to send message: ${postMessageResponse.error}`);
    }
  };

  const promiseMatchedGroups = matched_groups.map(sendToMatchedGroup);
  const promiseUnmachedUsers = unmatched_users.map(sendToUnmachedUser);
  try {
    await Promise.all([...promiseMatchedGroups, ...promiseUnmachedUsers]);
  } catch (error) {
    return { error };
  }

  const leaveResponse = await client.conversations.leave({ channel });
  if (!leaveResponse.ok) {
    return { error: `Failed to leave the channel: ${leaveResponse.error}` };
  }

  const compMessageResponse = await client.chat.postMessage({
    channel: channel,
    text: `マッチング完了しました🎉\nコーヒーチャットの写真の投稿待ってます🖼️`,
  });
  if (!compMessageResponse.ok) {
    return {
      error: `Failed to send message: ${compMessageResponse.error}`,
    };
  }

  return { outputs: {} };
});
