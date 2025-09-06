# Bakul MCP Server

A Model Context Protocol (MCP) server that wraps the [Bakul AI](https://ba.kul.to) API endpoints.

## Features

This MCP server provides tools for:

- **Health Check**: Verify API availability
- **User Registration**: Create new user accounts  
- **API Key Management**: Rotate authentication keys
- **Dataset Management**: Create and update datasets
- **Public Dataset Access**: Retrieve public datasets and schemas

## Available Tools

### Authentication
- `health_check` - Check API health status
- `register_user` - Register a new user account
- `rotate_api_key` - Rotate API authentication key
- `get_api_key_status` - Check API key configuration and test authentication

### Dataset Management
- `create_dataset` - Create a new dataset
- `update_dataset` - Update an existing dataset
- `get_public_dataset` - Retrieve a public dataset by username and ID
- `get_public_dataset_schema` - Get the schema of a public dataset

## Installation

```bash
pnpm install
```

## Usage

### Development
```bash
pnpm dev
```

### Production
```bash
pnpm start
```

The server runs on stdio and communicates via the MCP protocol.

## Configuration

The server connects to the Bakul API at `https://ba.kul.to/api`.

### API Key Setup

1. **Get an API Key**: Register a new user using the `register_user` tool
2. **Set Environment Variable**: 
   ```bash
   export BAKUL_API_KEY=your_api_key_here
   ```
3. **Alternative**: Use the `API_KEY` environment variable

See `config.example` for a configuration template.

### Environment Variables

- `BAKUL_API_KEY` - Your Bakul API key (primary)
- `API_KEY` - Alternative API key variable (fallback)

## Tool Usage Examples

Each tool includes built-in usage instructions in its responses to help guide AI agents on proper usage patterns.

## Technical Notes

- Uses TypeScript with tsx for runtime execution
- Zod schemas for input validation
- Includes comprehensive error handling
- All API responses include tool usage guidance for AI agents

## API Reference

The server wraps endpoints documented in the [Bakul API OpenAPI specification](https://ba.kul.to/api/openapi.json).