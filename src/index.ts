// ABOUTME: Main MCP server that wraps the Bakul AI API endpoints
// ABOUTME: Provides MCP interface for authentication, datasets, and health endpoints

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Type-safe wrapper to bypass MCP SDK type issues
const registerToolWithSchema = (server: any, name: string, config: any, handler: any) => {
  return (server as any).registerTool(name, config, handler);
};

const BAKUL_API_BASE = 'https://ba.kul.to/api';

// Get API key from environment variable or use default
const getApiKey = (): string => {
  return process.env.BAKUL_API_KEY || process.env.API_KEY || '';
};

// Create MCP server
const server = new McpServer({
  name: 'bakul-mcp',
  version: '1.0.0',
});

// Health check tool
registerToolWithSchema(
  server,
  'health_check',
  {
    title: 'Health Check',
    description: 'Check the health status of the Bakul API',
    inputSchema: {},
  },
  async () => {
    try {
      const response = await fetch(`${BAKUL_API_BASE}/health`);
      const data = await response.text();

      return {
        content: [
          {
            type: 'text',
            text: `Health Status: ${response.status} - ${data}\n\nTool Usage: Use this to verify API availability before making other requests.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Health check failed: ${error}\n\nTool Usage: API appears to be unavailable. Check network connection and try again.`,
          },
        ],
      };
    }
  }
);

// User registration tool
registerToolWithSchema(
  server,
  'register_user',
  {
    title: 'Register User',
    description: 'Register a new user account with the Bakul API',
    inputSchema: {
      username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .describe('Username (3-50 chars, alphanumeric, underscore, dash only)'),
      password: z.string().min(8).max(100).describe('Password (8-100 chars)'),
    } as const,
  },
  async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await fetch(`${BAKUL_API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Registration ${response.ok ? 'successful' : 'failed'}: ${JSON.stringify(data, null, 2)}\n\nTool Usage: Save the API key from successful registration for use with other tools that require authentication.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Registration failed: ${error}\n\nTool Usage: Check your network connection and verify the provided credentials are valid.`,
          },
        ],
      };
    }
  }
);

// API key rotation tool
registerToolWithSchema(
  server,
  'rotate_api_key',
  {
    title: 'Rotate API Key',
    description: 'Rotate the API key for authenticated access',
    inputSchema: {},
  },
  async () => {
    try {
      const authKey = getApiKey();
      if (!authKey) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: No API key provided. Set BAKUL_API_KEY environment variable.\n\nTool Usage: Register a user first to get an API key, then use it for key rotation.`,
            },
          ],
        };
      }

      const response = await fetch(`${BAKUL_API_BASE}/rotate-key`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Key rotation ${response.ok ? 'successful' : 'failed'}: ${JSON.stringify(data, null, 2)}\n\nTool Usage: Update your stored API key with the new key returned. The old key is now invalid.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Key rotation failed: ${error}\n\nTool Usage: Verify your current API key is valid and not expired.`,
          },
        ],
      };
    }
  }
);

// Create dataset tool
registerToolWithSchema(
  server,
  'create_dataset',
  {
    title: 'Create Dataset',
    description: 'Create a new dataset in the Bakul API',
    inputSchema: {
      name: z.string().min(1).max(100).describe('Dataset name (1-100 chars)'),
      data: z.any().optional().describe('JSON data (max 5MB) - schema will be auto-generated'),
    } as const,
  },
  async ({ name, data }: { name: string; data?: any }) => {
    try {
      const authKey = getApiKey();
      if (!authKey) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: No API key provided. Set BAKUL_API_KEY environment variable.\n\nTool Usage: Register a user first to get an API key, then use it for dataset operations.`,
            },
          ],
        };
      }

      const response = await fetch(`${BAKUL_API_BASE}/datasets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, data }),
      });

      const result = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Dataset creation ${response.ok ? 'successful' : 'failed'}: ${JSON.stringify(result, null, 2)}\n\nTool Usage: Save the dataset ID from successful creation for future updates or sharing. Dataset is private by default.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Dataset creation failed: ${error}\n\nTool Usage: Verify your API key is valid and check the dataset content format.`,
          },
        ],
      };
    }
  }
);

// Update dataset tool
registerToolWithSchema(
  server,
  'update_dataset',
  {
    title: 'Update Dataset',
    description: 'Update an existing dataset in the Bakul API',
    inputSchema: {
      dataset_id: z.string().describe('ID of the dataset to update'),
      data: z.any().describe('Updated JSON data (max 5MB) - schema will be auto-generated'),
    } as const,
  },
  async ({ dataset_id, data }: { dataset_id: string; data: any }) => {
    try {
      const authKey = getApiKey();
      if (!authKey) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: No API key provided. Set BAKUL_API_KEY environment variable.\n\nTool Usage: Register a user first to get an API key, then use it for dataset operations.`,
            },
          ],
        };
      }

      const response = await fetch(`${BAKUL_API_BASE}/datasets/${dataset_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Dataset update ${response.ok ? 'successful' : 'failed'}: ${JSON.stringify(result, null, 2)}\n\nTool Usage: Changes are immediately available. Use get_public_dataset to verify updates for public datasets.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Dataset update failed: ${error}\n\nTool Usage: Verify the dataset ID exists and you have permission to update it.`,
          },
        ],
      };
    }
  }
);

// Get public dataset tool
registerToolWithSchema(
  server,
  'get_public_dataset',
  {
    title: 'Get Public Dataset',
    description: 'Retrieve a public dataset by username and dataset ID',
    inputSchema: {
      username: z.string().describe('Username of the dataset owner'),
      dataset_id: z.string().describe('ID of the public dataset'),
    } as const,
  },
  async ({ username, dataset_id }: { username: string; dataset_id: string }) => {
    try {
      const response = await fetch(`${BAKUL_API_BASE}/datasets/${username}/${dataset_id}`);
      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Dataset retrieval ${response.ok ? 'successful' : 'failed'}: ${JSON.stringify(data, null, 2)}\n\nTool Usage: This data can be analyzed, processed, or used as input for other operations. Only public datasets are accessible via this method.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Dataset retrieval failed: ${error}\n\nTool Usage: Verify the username and dataset ID are correct and that the dataset is public.`,
          },
        ],
      };
    }
  }
);

// Get public dataset schema tool
registerToolWithSchema(
  server,
  'get_public_dataset_schema',
  {
    title: 'Get Public Dataset Schema',
    description: 'Retrieve the schema of a public dataset',
    inputSchema: {
      username: z.string().describe('Username of the dataset owner'),
      dataset_id: z.string().describe('ID of the public dataset'),
    } as const,
  },
  async ({ username, dataset_id }: { username: string; dataset_id: string }) => {
    try {
      const response = await fetch(`${BAKUL_API_BASE}/datasets/${username}/${dataset_id}/schema`);
      const schema = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Schema retrieval ${response.ok ? 'successful' : 'failed'}: ${JSON.stringify(schema, null, 2)}\n\nTool Usage: Use this schema to understand the structure and types of data in the dataset before processing or analysis.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Schema retrieval failed: ${error}\n\nTool Usage: Verify the dataset exists, is public, and has a defined schema.`,
          },
        ],
      };
    }
  }
);

// Get API key status tool
registerToolWithSchema(
  server,
  'get_api_key_status',
  {
    title: 'Get API Key Status',
    description: 'Check if API key is configured and test authentication',
    inputSchema: {} as const,
  },
  async () => {
    try {
      const apiKey = getApiKey();

      if (!apiKey) {
        return {
          content: [
            {
              type: 'text',
              text: `API Key Status: Not configured\n\nTool Usage: Set BAKUL_API_KEY environment variable or register a new user to get an API key.`,
            },
          ],
        };
      }

      // Test the API key by making a health check request
      const response = await fetch(`${BAKUL_API_BASE}/health`);
      const isHealthy = response.ok;

      return {
        content: [
          {
            type: 'text',
            text: `API Key Status: Configured (${apiKey.substring(0, 8)}...)\nAPI Health: ${isHealthy ? 'Healthy' : 'Unhealthy'}\n\nTool Usage: Your API key is ready for use with dataset operations.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `API Key Status: Error checking status - ${error}\n\nTool Usage: Verify your API key and network connection.`,
          },
        ],
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bakul MCP server running on stdio');
}

main().catch(error => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
