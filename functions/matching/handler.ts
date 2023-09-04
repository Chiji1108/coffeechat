import { SlackFunction } from "deno-slack-sdk/mod.ts";
// import MatchingHistoryDatastore from "../../datastores/matching_history.ts";
import { MatchingFunction } from "./definition.ts";
import { shuffle } from "./utils/shuffle.ts";
import { sliceByNumber } from "./utils/slice_by_number.ts";

export const MATCHING_NUMBER = 2;

export default SlackFunction(
  MatchingFunction,
  async ({ inputs, client }) => {
    const { channel, user } = inputs;

    //Validation
    // const channelResponse = await client.conversations.info({
    //   channel,
    // });
    // if (!channelResponse.ok) {
    //   return { error: `Failed to get channel info: ${channelResponse.error}` };
    // }
    // if (!channelResponse.channel.is_channel) {
    //   if (user) {
    //     const response = await client.chat.postEphemeral({
    //       channel,
    //       text:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //       user,
    //     });
    //     if (!response.ok) {
    //       return { error: `Failed to send message: ${response.error}` };
    //     }
    //     return {
    //       error:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //     };
    //   } else {
    //     const response = await client.chat.postMessage({
    //       channel,
    //       text:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //     });
    //     if (!response.ok) {
    //       return { error: `Failed to send message: ${response.error}` };
    //     }
    //     return {
    //       error:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //     };
    //   }
    // }

    const startMessage = user
      ? `<@${user}>さんによってマッチングを開始します☕️`
      : `スケジューラーによりマッチングを開始します☕️`;

    const startMessageResponse = await client.chat.postMessage({
      channel,
      text: startMessage,
    });
    if (!startMessageResponse.ok) {
      return {
        error: `Failed to send message: ${startMessageResponse.error}`,
      };
    }

    const membersResponse = await client.conversations.members({
      channel,
      limit: 999,
    });
    if (
      !membersResponse.ok || !membersResponse.members ||
      !Array.isArray(membersResponse.members)
    ) {
      return {
        error: `Failed to get the channel's members: ${membersResponse.error}`,
      };
    }
    const members: string[] = [...membersResponse.members];
    const membersMessageResponse = await client.chat.postMessage({
      channel,
      thread_ts: startMessageResponse.ts,
      text: `マッチング対象ユーザー: \n` +
        members.map((u) => `<@${u}>`).join(", ") + "\n計" + members.length +
        "人",
    });
    if (!membersMessageResponse.ok) {
      return {
        error: `Failed to send message: ${membersMessageResponse.error}`,
      };
    }

    const shuffledMembers = shuffle(members);
    const groups = sliceByNumber(shuffledMembers, MATCHING_NUMBER);
    const matchedGroups = groups.filter((g) => g.length === MATCHING_NUMBER);
    const unmatchedUsers = groups.filter((g) => g.length !== MATCHING_NUMBER)
      .flat();

    // const matchingHistory = new Map<string, string[]>();
    // const getMatchedUsers = async (
    //   u: string,
    // ) => {
    //   const datastoreResponse = await client.apps.datastore.get<
    //     typeof MatchingHistoryDatastore.definition
    //   >({
    //     datastore: MatchingHistoryDatastore.name,
    //     id: u,
    //   });
    //   if (!datastoreResponse.ok) {
    //     throw new Error(
    //       `Failed to access matching history datastore: ${datastoreResponse.error}`,
    //     );
    //   }
    //   matchingHistory.set(u, datastoreResponse.item.matched_users ?? []);
    // };
    // try {
    //   await Promise.all(
    //     unmatchedUsers.map(getMatchedUsers),
    //   );
    // } catch (error) {
    //   return { error };
    // }

    // while (unmatchedUsers.length >= 2) {
    //   const userA = getRandom(unmatchedUsers);
    //   const matchedUsersForA = matchingHistory.get(userA);
    //   if (!matchedUsersForA) return { error: `Map() Coding Error` };
    //   console.log("matchedUsersForA", matchedUsersForA);

    //   const unmatchedUsersExceptA = unmatchedUsers.filter((u) => u != userA);
    //   const targetsForUserA: string[] = [];
    //   const difference = [
    //     ...getDifference(
    //       new Set(unmatchedUsersExceptA),
    //       new Set(matchedUsersForA),
    //     ),
    //   ];
    //   if (difference.length > 0) {
    //     targetsForUserA.push(...difference);
    //   } else {
    //     targetsForUserA.push(...unmatchedUsersExceptA);
    //   }

    //   const userB = getRandom(targetsForUserA);
    //   const matchedUsersForB = matchingHistory.get(userB);
    //   if (!matchedUsersForB) return { error: `Map() Coding Error` };
    //   console.log("matchedUsersForB", matchedUsersForB);

    //   matchingHistory.set(userA, [...new Set([...matchedUsersForA, userB])]);
    //   matchingHistory.set(userB, [...new Set([...matchedUsersForB, userA])]);
    //   matchedGroups.push([userA, userB]);

    //   removeItem(unmatchedUsers, userA);
    //   removeItem(unmatchedUsers, userB);
    // }

    // const putMatchedUsers = async (u: string, users: string[]) => {
    //   const putDatastoreResponse = await client.apps.datastore.put<
    //     typeof MatchingHistoryDatastore.definition
    //   >({
    //     datastore: MatchingHistoryDatastore.name,
    //     item: {
    //       user_id: u,
    //       matched_users: [...new Set(users)],
    //     },
    //   });
    //   if (!putDatastoreResponse.ok) {
    //     throw new Error(
    //       `Failed to put B Response: ${putDatastoreResponse.error}`,
    //     );
    //   }
    // };
    // try {
    //   await Promise.all(
    //     Array.from(matchingHistory.entries()).map(([key, value]) =>
    //       putMatchedUsers(key, value)
    //     ),
    //   );
    // } catch (error) {
    //   return { error };
    // }

    return {
      outputs: {
        matching_result: {
          matched_groups: matchedGroups,
          unmatched_users: unmatchedUsers,
        },
      },
    };
  },
);
