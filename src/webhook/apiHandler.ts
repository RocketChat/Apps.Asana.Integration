import { IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { AsanaApp } from "../../AsanaApp";

// get user of inside the rc-app login user
export const getUser = async (
  accessToken: string,
  http: IHttp
): Promise<any> => {
  try {
    const response = await http.get(`https://app.asana.com/api/1.0/users/me`, {
      headers: getAuthHeaders(accessToken),
    });

    if (response.statusCode === 200 && response.data) {
      return response.data.data;
    } else {
      throw new Error("Failed to get user");
      // return null;
    }
  } catch (error) {
    throw new Error("Error getting user");
    // return null;
  }
};

// get user
export const getUserSpecific = async (
  accessToken: string,
  user_gid: string,
  http: IHttp
): Promise<any> => {
  try {
    const response = await http.get(
      `https://app.asana.com/api/1.0/users/${user_gid}`,
      {
        headers: getAuthHeaders(accessToken),
      }
    );

    if (response.statusCode === 200 && response.data?.data) {
      return response.data.data; // returns full user object (includes .name, .email, etc.)
    } else {
      throw new Error(
        `Failed to get user. Status code: ${response.statusCode}`
      );
    }
  } catch (error) {
    throw new Error(`Error getting user: ${(error as Error).message}`);
  }
};

// Register Webhook
export const establishWebhook = async (
  app: AsanaApp,
  accessToken: string,
  targetUri: string,
  resourceId: string,
  http: IHttp
) => {
  const url = "https://app.asana.com/api/1.0/webhooks";

  if (!accessToken) {
    throw new Error("Authentication required: No access token provided");
  }
  if (!resourceId) {
    throw new Error("Resource ID is required");
  }
  if (!targetUri) {
    throw new Error("Target URL is required");
  }

  // These are the filters we want to apply to our webhook [ can change later ]
  const filters = [
    { action: "added", resource_type: "task" },
    { action: "removed", resource_type: "task" },
    { action: "changed", resource_type: "task" },
    { action: "deleted", resource_type: "task" },
    { action: "undeleted", resource_type: "task" },
  ];

  try {
    const response = await http.post(url, {
      content: JSON.stringify({
        data: {
          resource: resourceId,
          target: targetUri,
          filters: filters, // optional
        },
      }),
      headers: getAuthHeaders(accessToken),
    });

    if (response.statusCode === 201 && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (err) {
    throw new Error(`Error creating Webhook: ${err}`);
  }
};

//Delete Webhook
export const deleteWebhooks = async (
  accessToken: string,
  webhook_gid: string,
  http: IHttp
) => {
  const url = "https://app.asana.com/api/1.0/webhooks";

  if (!accessToken) {
    throw new Error("Authentication required: No access token provided");
  }
  if (!webhook_gid) {
    throw new Error("Resource ID is required");
  }

  try {
    const response = await http.del(`${url}/${webhook_gid}`, {
      headers: getAuthHeaders(accessToken),
    });

    if (response.statusCode === 200) {
      return response.statusCode;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (err) {
    throw new Error(`Error deleting Webhook: ${err}`);
  }
};

// Get authorization header information
function getAuthHeaders(accessToken: string): { [key: string]: string } {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };
}
