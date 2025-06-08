import {
  IModify,
  IPersistence,
  IRead,
  IHttp,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { AsanaApp } from "../../../AsanaApp";
import { RocketChatAssociationModel } from "@rocket.chat/apps-engine/definition/metadata";
import { RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";
import { sendDirectMessage } from "../../helpers/message";
import { IAuthData } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
import { deleteWebhooks } from "../../webhook/apiHandler";

export async function deleteWebhook(
  app: AsanaApp,
  read: IRead,
  modify: IModify,
  user: IUser,
  params: string[],
  persistence: IPersistence,
  http: IHttp
) {
  if (!params || params.length === 0) {
    await sendDirectMessage({
      read,
      modify,
      user,
      persistence,
      message: "⚠️ Please provide a resource ID to delete the webhook.",
    });
    return;
  }

  const assoc = new RocketChatAssociationRecord(
    RocketChatAssociationModel.USER,
    user.id
  );

  const storedTokens = await read
    .getPersistenceReader()
    .readByAssociation(assoc);

  if (!storedTokens || storedTokens.length === 0) {
    await sendDirectMessage({
      read: read,
      modify: modify,
      user: user,
      persistence: persistence,
      message:
        "❌ You are not logged in to Asana. Please log in to Asana first.",
    });
    return;
  }

  const tokenData = storedTokens[0] as {
    token: string;
    refreshToken: string;
    scope?: string | null;
    expiresAt?: number;
  };

  const accessToken = tokenData.token;
  const webhook_gid = params[0];

  try {
    const webhook = await deleteWebhooks(accessToken, webhook_gid, http);
    console.log(webhook);
    if (webhook === 200) {
      await sendDirectMessage({
        read: read,
        modify: modify,
        user: user,
        persistence: persistence,
        message: `✅ Webhook deleted successfully for resource ID: ${webhook_gid}`,
      });
    }
  } catch (err: any) {
    await sendDirectMessage({
      read: read,
      modify: modify,
      user: user,
      persistence: persistence,
      message: `❌ Something went wrong: ${err.message || err}`,
    });
  }
}
