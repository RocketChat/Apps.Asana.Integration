import {
  IPersistence,
  IRead,
  IModify,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
  RocketChatAssociationModel,
  RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendDirectMessage } from "../../helpers/message";

export async function logoutUser(
  read: IRead,
  modify: IModify,
  persistence: IPersistence,
  user: IUser
): Promise<void> {
  const assoc = new RocketChatAssociationRecord(
    RocketChatAssociationModel.USER,
    user.id
  );

  const storedTokens = await read
    .getPersistenceReader()
    .readByAssociation(assoc);

  if (!storedTokens || storedTokens.length === 0) {
    await sendDirectMessage({
      read,
      modify,
      user,
      persistence,
      message: "⚠️ You are not logged in to Asana.",
    });
    return;
  }

  await persistence.removeByAssociation(assoc);

  await sendDirectMessage({
    read,
    modify,
    user,
    persistence,
    message: "✅ You have been successfully logged out of Asana.",
  });
}
