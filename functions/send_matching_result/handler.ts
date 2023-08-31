import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { SendMatchingResultFunction } from "./definition.ts";

export default SlackFunction(
  SendMatchingResultFunction,
  async ({ inputs, client }) => {
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

    const errorUsers: string[] = [];

    const sendToMatchedGroup = async (users: string[]) => {
      console.log("users", users);
      const convOpenResponse = await client.conversations.open({
        users: users.join(),
      });
      if (!convOpenResponse.ok) {
        errorUsers.push(...users);
        throw new Error(
          `Failed to open conversation for ${users}: ${convOpenResponse.error}`,
        );
      }
      const postMessageResponse = await client.chat.postMessage({
        channel: convOpenResponse.channel.id,
        text: `${
          users.map((u) => (`<@${u}>さん`)).join()
        }こんにちは👋\n<#${channel}>のコーヒーチャットの時間です🎉\n予定を合わせて楽しいコーヒーチャットを☕️`,
      });
      if (!postMessageResponse.ok) {
        errorUsers.push(...users);
        throw new Error(`Failed to send message: ${postMessageResponse.error}`);
      }
    };

    const sendToUnmachedUser = async (user: string) => {
      const convOpenResponse = await client.conversations.open({
        users: user,
      });
      if (!convOpenResponse.ok) {
        errorUsers.push(user);
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
        errorUsers.push(user);
        throw new Error(`Failed to send message: ${postMessageResponse.error}`);
      }
    };

    const promiseMatchedGroups = matched_groups.map(sendToMatchedGroup);
    const promiseUnmachedUsers = unmatched_users.map(sendToUnmachedUser);

    await Promise.allSettled([
      ...promiseMatchedGroups,
      ...promiseUnmachedUsers,
    ]);

    const leaveResponse = await client.conversations.leave({ channel });
    if (!leaveResponse.ok) {
      return { error: `Failed to leave the channel: ${leaveResponse.error}` };
    }

    const compMessageResponse = await client.chat.postMessage({
      channel: channel,
      text: `マッチング完了しました🎉`,
    });
    if (!compMessageResponse.ok) {
      return {
        error: `Failed to send message: ${compMessageResponse.error}`,
      };
    }

    const matched_groups_text = matched_groups.map((users) =>
      "- " + users.map((user) => `<@${user}>`).join(", ")
    ).join("\n");
    const unmatched_users_text = unmatched_users.map((user) => `<@${user}>`)
      .join(", ");
    const error_message = errorUsers.length > 0
      ? `\nレート制限によりメッセージを送れなかったユーザー: \n` +
        errorUsers.map((u) => `<@${u}>`).join(", ")
      : "";

    const detailMessageResponse = await client.chat.postMessage({
      channel,
      thread_ts: compMessageResponse.ts,
      text: `マッチングできたグループ: \n` + matched_groups_text +
        "\nマッチングできなかったユーザー: \n" + unmatched_users_text +
        error_message,
    });
    if (detailMessageResponse.error) {
      return {
        error: `Failed to send message: ${detailMessageResponse.error}`,
      };
    }

    return { outputs: {} };
  },
);
