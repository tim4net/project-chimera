#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { initializeSupabase } from './services/supabase.js';
import * as loreTools from './tools/lore.js';
import * as geoTools from './tools/geography.js';

// Load environment variables
config({ path: '../.env' });

// Initialize Supabase
initializeSupabase();

// Create MCP server
const server = new Server(
  {
    name: '@nuaibria/world-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: 'get_world_lore',
    description: 'Fetch world lore entries by category (creation_myth, historical_event, legend, prophecy) and/or era (ancient, old_empire, fall, current)',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Lore category to filter by' },
        era: { type: 'string', description: 'Historical era to filter by' },
        limit: { type: 'number', description: 'Maximum number of results' }
      }
    }
  },
  {
    name: 'get_deity',
    description: 'Get details about a specific deity by name',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the deity' }
      },
      required: ['name']
    }
  },
  {
    name: 'list_deities',
    description: 'List all deities with optional filtering by domain or alignment',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Filter by domain (e.g., knowledge, war, death)' },
        alignment: { type: 'string', description: 'Filter by alignment' },
        active_only: { type: 'boolean', description: 'Only show active deities' }
      }
    }
  },
  {
    name: 'get_race_lore',
    description: 'Get extended cultural and historical lore for a playable race',
    inputSchema: {
      type: 'object',
      properties: {
        race: { type: 'string', description: 'Name of the race (e.g., Elf, Dwarf)' }
      },
      required: ['race']
    }
  },
  {
    name: 'get_historical_timeline',
    description: 'Get chronological historical events',
    inputSchema: {
      type: 'object',
      properties: {
        era: { type: 'string', description: 'Filter by era' },
        event_type: { type: 'string', description: 'Filter by event type (war, cataclysm, etc.)' },
        limit: { type: 'number', description: 'Maximum number of events' }
      }
    }
  },
  {
    name: 'get_location',
    description: 'Get details about a specific location by ID or name',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Location UUID' },
        name: { type: 'string', description: 'Location name' }
      }
    }
  },
  {
    name: 'list_locations_nearby',
    description: 'List locations within a radius of given coordinates',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'X coordinate' },
        y: { type: 'number', description: 'Y coordinate' },
        radius: { type: 'number', description: 'Search radius' },
        campaign_seed: { type: 'string', description: 'Filter by campaign' }
      },
      required: ['x', 'y', 'radius']
    }
  },
  {
    name: 'get_region',
    description: 'Get world region information',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Region UUID' },
        name: { type: 'string', description: 'Region name' }
      }
    }
  }
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'get_world_lore':
        result = await loreTools.getWorldLore(args || {});
        break;
      case 'get_deity':
        result = await loreTools.getDeity(args as { name: string });
        break;
      case 'list_deities':
        result = await loreTools.listDeities(args || {});
        break;
      case 'get_race_lore':
        result = await loreTools.getRaceLore(args as { race: string });
        break;
      case 'get_historical_timeline':
        result = await loreTools.getHistoricalTimeline(args || {});
        break;
      case 'get_location':
        result = await geoTools.getLocation(args || {});
        break;
      case 'list_locations_nearby':
        result = await geoTools.listLocationsNearby(args as any);
        break;
      case 'get_region':
        result = await geoTools.getRegion(args || {});
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Nuaibria World MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
