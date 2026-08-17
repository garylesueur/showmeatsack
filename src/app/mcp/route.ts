import { createMcpHandler } from "mcp-handler";
import { getDefaultShareService } from "@/lib/app-shares";
import {
  SHOWMEATSACK_TOOL_NAME,
  createShowmeatsackTool,
  isShowmeatsackToolError,
  showmeatsackToolInputSchema,
} from "@/lib/showmeatsack-tool";

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      SHOWMEATSACK_TOOL_NAME,
      {
        description:
          "Publish HTML or a small static-site zip to showmeatsack.com. Create returns a view URL that is the page and a manage token to replace or delete it. Same as the HTTP API.",
        inputSchema: showmeatsackToolInputSchema,
      },
      async (args) => {
        const tool = createShowmeatsackTool(getDefaultShareService());
        const result = await tool.invoke(args);
        const text = JSON.stringify(result);
        if (isShowmeatsackToolError(result)) {
          return {
            content: [{ type: "text" as const, text }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text" as const, text }],
        };
      },
    );
  },
  {
    serverInfo: {
      name: "showmeatsack.com",
      version: "0.1.0",
    },
  },
);

function withMcpCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization, mcp-session-id, mcp-protocol-version, Last-Event-ID",
  );
  headers.set(
    "Access-Control-Expose-Headers",
    "mcp-session-id, mcp-protocol-version",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function POST(request: Request): Promise<Response> {
  return withMcpCors(await mcpHandler(request));
}

export async function GET(request: Request): Promise<Response> {
  return withMcpCors(await mcpHandler(request));
}

export async function DELETE(request: Request): Promise<Response> {
  return withMcpCors(await mcpHandler(request));
}

export async function OPTIONS(): Promise<Response> {
  return withMcpCors(new Response(null, { status: 204 }));
}
