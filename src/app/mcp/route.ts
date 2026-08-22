import { createMcpHandler } from "mcp-handler";
import {
  htmlDocumentResponse,
  markdownResponse,
  mcpGetDocumentKind,
  mcpGuideHtml,
  mcpGuideMarkdown,
} from "@/lib/agent-docs";
import { getDefaultShareService } from "@/lib/app-shares";
import { runWithIncomingRequest } from "@/lib/incoming-request";
import { SHOWMEATSACK_SKILL_MARKDOWN } from "@/lib/showmeatsack-skill";
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
          'Use this whenever a person should look at something you built — a report, deck, comparison, plan, or diagram — instead of a wall of chat text, a local file, or a screenshot. Also the right tool when they say "show me", "let me see it", "make me a page", "give me a link", or any dictated form of meatsack ("meat sack", "mute sack", "meats act", "meat sac"). Publish HTML, GitHub-flavoured markdown (including mermaid diagrams), or a small static-site zip to showmeatsack.com. Create returns a view URL that is the page. Put that URL where a person will open it (this chat, email, Slack, or anywhere else you can already send). Also returns a manage token to replace or delete. Read needs no token — given a shareId from any view link it returns that page’s content, so a share link someone hands you can be read without fetching the URL. Same as the HTTP API.',
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
    // Clients that install the bare MCP URL never see skills/showmeatsack/SKILL.md.
    // The initialize result is the only channel that reaches them, so ship it here.
    instructions: SHOWMEATSACK_SKILL_MARKDOWN,
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
  headers.set("Access-Control-Expose-Headers", "mcp-session-id, mcp-protocol-version");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function POST(request: Request): Promise<Response> {
  return runWithIncomingRequest(request, async () => withMcpCors(await mcpHandler(request)));
}

export async function GET(request: Request): Promise<Response> {
  const kind = mcpGetDocumentKind(request);
  if (kind === "markdown") {
    return markdownResponse(mcpGuideMarkdown());
  }
  if (kind === "html") {
    return htmlDocumentResponse(mcpGuideHtml());
  }
  return runWithIncomingRequest(request, async () => withMcpCors(await mcpHandler(request)));
}

export async function DELETE(request: Request): Promise<Response> {
  return runWithIncomingRequest(request, async () => withMcpCors(await mcpHandler(request)));
}

export async function OPTIONS(): Promise<Response> {
  return withMcpCors(new Response(null, { status: 204 }));
}
