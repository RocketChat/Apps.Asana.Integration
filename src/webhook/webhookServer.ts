import {
  IApiEndpoint,
  IApiRequest,
  IApiResponse,
  ApiEndpoint,
  IApiEndpointInfo,
} from "@rocket.chat/apps-engine/definition/api";
import { App } from "@rocket.chat/apps-engine/definition/App";
import {
  IHttp,
  IModify,
  IPersistence,
  IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { sendDirectMessage } from "../helpers/message";
import * as crypto from "crypto";
import { getUserSpecific } from "./apiHandler";
import {
  RocketChatAssociationModel,
  RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IAuthData } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";

let secret = ""; // In production, store this securely per user or app context

export class ReceiveWebhookEndpoint extends ApiEndpoint {
  public path = "receiveWebhook";

  constructor(public readonly app: App) {
    super(app);
  }

  public async post(
    request: IApiRequest,
    endpoint: IApiEndpointInfo,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persis: IPersistence
  ): Promise<IApiResponse> {
    const headers = request.headers;

    // Handle handshake
    if (headers["x-hook-secret"]) {
      const hookSecret = Array.isArray(headers["x-hook-secret"])
        ? headers["x-hook-secret"][0]
        : headers["x-hook-secret"];

      secret = hookSecret;

      return {
        status: 200,
        headers: { "X-Hook-Secret": secret },
        content: "",
      };
    }

    // Handle event signature validation
    if (headers["x-hook-signature"]) {
      const signature = Array.isArray(headers["x-hook-signature"])
        ? headers["x-hook-signature"][0]
        : headers["x-hook-signature"];

      const bodyString = JSON.stringify(request.content);

      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(bodyString)
        .digest("hex");

      const sigBuffer = Buffer.from(signature);
      const expectedSigBuffer = Buffer.from(expectedSig);

      if (
        sigBuffer.length !== expectedSigBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
      ) {
        return {
          status: 401,
          content: "Unauthorized: Invalid signature",
        };
      }

      // Signature valid — process events
      const events = (request.content as any)?.events;

      if (!events || !Array.isArray(events)) {
        return {
          status: 400,
          content: "Bad request: No events array found",
        };
      }

      const userId = request.query?.userId;
      const appUser = await read.getUserReader().getAppUser();

      if (!userId) {
        return { status: 400, content: "Missing userId in query params" };
      }

      if (!appUser) {
        return { status: 500, content: "App user not found" };
      }

      const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        userId
      );

      const storedTokens = await read
        .getPersistenceReader()
        .readByAssociation(assoc);

      const tokenData = storedTokens[0] as IAuthData;

      const token = tokenData;
      const accessToken = token.token;

      const seen = new Set<string>();

      for (const event of events) {
        const action = event.action;
        const resource = event.resource;
        const user = event.user;
        const parent = event.parent;
        const change = event.change;
        const dte = event.created_at;

        const uniqueKey = `${resource?.gid}:${action}:${change?.field}`;
        if (seen.has(uniqueKey)) {
          this.app.getLogger().debug(`Duplicate event skipped: ${uniqueKey}`);
          continue;
        }
        seen.add(uniqueKey);

        function formatDateUTC(dateStr: string): string {
          const date = new Date(dateStr);
          return date.toUTCString(); // -> "Fri, 06 Jun 2025 05:32:42 GMT"
        }

        let displayName = "Unknown";
        try {
          const userDetails = await getUserSpecific(
            accessToken,
            user?.gid,
            http
          );
          displayName = userDetails?.name || "Unknown";
        } catch (e) {
          this.app.getLogger().error("Error fetching user name", e);
        }

        const logDetails = `
                🧠 *Asana Webhook Event*  
                👤 User: ${displayName}
                📝 Resource: ${resource?.name || resource?.gid} (${
          resource?.resource_type
        })  
                🔁 Action: ${action}  
                📁 Parent/Project: ${parent || "N/A"}  
                🔧 Field Changed: ${change?.field || "N/A"}  
                📆 Created at: ${dte ? formatDateUTC(dte) : "N/A"}
          `;

        this.app
          .getLogger()
          .info("Sending message for Asana event:", logDetails);

        try {
          await sendDirectMessage({
            read,
            modify,
            persistence: persis,
            user: appUser,
            message: logDetails,
          });
          this.app.getLogger().info("✅ Message sent successfully");
          return {
            status: 200,
            content: "OK",
          };
        } catch (err) {
          this.app.getLogger().error("❌ Failed to send message:", err);
          return {
            status: 500,
            content: "Failed to process webhook event",
          };
        }
      }
    }

    // No valid headers
    return {
      status: 400,
      content: "Bad request: Missing required headers",
    };
  }
}
