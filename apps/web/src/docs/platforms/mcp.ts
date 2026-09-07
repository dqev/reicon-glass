import type { PlatformDoc } from "./types";

export const mcpDoc: PlatformDoc = {
  id: "mcp",
  name: "MCP Server (AI Agents)",
  badge: "MCP Server",
  tagline: "Model Context Protocol server allowing Claude, Antigravity, and AI Agents to query & generate icons.",
  pkg: "@reicon/mcp-server",
  install: "npx @reicon/mcp-server@latest",
  basicUsage: `// Add to your MCP config (e.g. mcp_config.json or Claude Desktop)
{
  "mcpServers": {
    "reicon": {
      "command": "npx",
      "args": ["-y", "@reicon/mcp-server@latest"]
    }
  }
}`,
  extraTitle: "Available MCP Agent Tools",
  extraCode: `// 1. Search icons by semantic query
search_icons({ query: "security shield", limit: 5 })

// 2. Get SVG path data & React component code
get_icon({ name: "shield-check", format: "react" })

// 3. List icon categories
list_categories()`,
  notes: [
    "Allows LLM assistants to discover, inspect, and embed Reicon icons automatically.",
    "Supports SVG, React, Vue, and Web Component snippet generation."
  ]
};
