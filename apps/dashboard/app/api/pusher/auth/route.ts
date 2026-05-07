import { getCurrentUserWithPermissions } from "@/app/lib/permissions";
import { PUSHER_CHANNELS } from "@/types/pusher.types";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * Pusher Channel Authentication Route
 * Handles authentication for private and presence channels
 * Protects secret key by keeping it server-side only
 */

interface PusherAuthRequest {
  socket_id: string;
  channel_name: string;
}

interface PusherAuthResponse {
  auth: string;
  channel_data?: string; // For presence channels
}

interface PusherAuthError {
  error: string;
  message: string;
}

/**
 * Validate channel name format and user access
 */
function validateChannelAccess(
  channelName: string,
  userId: string
): { isValid: boolean; error?: string } {
  // Only allow private and presence channels
  if (
    !channelName.startsWith("private-") &&
    !channelName.startsWith("presence-")
  ) {
    return {
      isValid: false,
      error:
        "Invalid channel type. Only private and presence channels are allowed.",
    };
  }

  // Validate notification channels
  if (channelName.startsWith("private-notifications-")) {
    const expectedChannel = PUSHER_CHANNELS.NOTIFICATIONS.PRIVATE(userId);
    if (channelName !== expectedChannel) {
      return {
        isValid: false,
        error:
          "Unauthorized channel access. You can only subscribe to your own notification channel.",
      };
    }
  }

  // Validate ticket channels
  if (channelName.startsWith("private-tickets-")) {
    const expectedChannel = PUSHER_CHANNELS.TICKETS.PRIVATE(userId);
    if (channelName !== expectedChannel) {
      return {
        isValid: false,
        error:
          "Unauthorized channel access. You can only subscribe to your own ticket channel.",
      };
    }
  }

  // Allow presence channels (can add more validation if needed)
  if (channelName.startsWith("presence-")) {
    // For now, allow all authenticated users to subscribe to presence channels
    // Add more specific validation if needed
  }

  return { isValid: true };
}

/**
 * Generate Pusher authentication signature
 */
function generateAuthSignature(
  socketId: string,
  channelName: string,
  secret: string
): string {
  const stringToSign = `${socketId}:${channelName}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(stringToSign)
    .digest("hex");
  return signature;
}

/**
 * Generate channel data for presence channels
 */
function generateChannelData(
  userId: string,
  userInfo: { id: string; fullname: string; email: string }
): string {
  return JSON.stringify({
    user_id: userId,
    user_info: {
      id: userInfo.id,
      fullname: userInfo.fullname,
      email: userInfo.email,
    },
  });
}

/**
 * POST handler for Pusher channel authentication
 *
 * Export config to disable body parsing (we'll handle it manually)
 */
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    const appSecret = process.env.PUSHER_APP_SECRET;
    const appKey =
      process.env.PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_APP_KEY;

    if (!appSecret || !appKey) {
      console.error("[Pusher Auth] Missing Pusher configuration");
      return NextResponse.json<PusherAuthError>(
        {
          error: "server_error",
          message: "Server configuration error",
        },
        { status: 500 }
      );
    }

    // Validate user session
    const user = await getCurrentUserWithPermissions(request);

    if (!user) {
      // Return 403 instead of 401 to prevent Pusher from retrying aggressively
      return NextResponse.json<PusherAuthError>(
        {
          error: "forbidden",
          message: "Authentication required",
        },
        {
          status: 403,
          headers: {
            "Retry-After": "10", // Tell Pusher to wait 10 seconds before retrying
          },
        }
      );
    }

    // Parse request body (Pusher sends form data)
    let body: PusherAuthRequest;
    try {
      const text = await request.text();

      if (!text || text.length === 0) {
        return NextResponse.json<PusherAuthError>(
          {
            error: "invalid_request",
            message: "Empty request body",
          },
          { status: 400 }
        );
      }

      const params = new URLSearchParams(text);
      body = {
        socket_id: params.get("socket_id") || "",
        channel_name: params.get("channel_name") || "",
      };
    } catch (error) {
      console.error("[Pusher Auth] Failed to parse request body:", error);
      return NextResponse.json<PusherAuthError>(
        {
          error: "invalid_request",
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { socket_id, channel_name } = body;

    // Validate required fields
    if (!socket_id || !channel_name) {
      return NextResponse.json<PusherAuthError>(
        {
          error: "invalid_request",
          message: "Missing required fields: socket_id and channel_name",
        },
        { status: 400 }
      );
    }

    // Validate socket_id format
    if (typeof socket_id !== "string" || socket_id.length < 1) {
      return NextResponse.json<PusherAuthError>(
        {
          error: "invalid_request",
          message: "Invalid socket_id format",
        },
        { status: 400 }
      );
    }

    if (!user?.id) {
      return NextResponse.json<PusherAuthError>(
        {
          error: "unauthorized",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Validate channel access
    const validation = validateChannelAccess(channel_name, user.id);
    if (!validation.isValid) {
      return NextResponse.json<PusherAuthError>(
        {
          error: "forbidden",
          message: validation.error || "Channel access denied",
        },
        { status: 403 }
      );
    }

    // Generate authentication signature
    const authSignature = generateAuthSignature(
      socket_id,
      channel_name,
      appSecret
    );

    // Format auth string: APP_KEY:SIGNATURE
    const auth = `${appKey}:${authSignature}`;

    // Prepare response
    const response: PusherAuthResponse = {
      auth,
    };

    // Add channel_data for presence channels
    if (channel_name.startsWith("presence-")) {
      response.channel_data = generateChannelData(user.id, {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      });
    }

    return NextResponse.json<PusherAuthResponse>(response, { status: 200 });
  } catch (error) {
    console.error("[Pusher Auth] Unexpected error:", error);
    return NextResponse.json<PusherAuthError>(
      {
        error: "server_error",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
