bakul-mcp is the MCP server for the up-and-coming [Bakul AI](https://ba.kul.to).

The concept and design of this MCP are described in https://raw.githubusercontent.com/empeje/bakul/refs/heads/main/TODO.md.

This MCP server is a TypeScript implementation that communicates via standard input and output (stdio).

The goal of this server is to provide a robust MCP wrapper that extends the Bakul AI API, as defined in https://ba.kul.to/api/openapi.json.

A key objective is to include additional instructions on tool usage for the AI in every MCP response to API calls.