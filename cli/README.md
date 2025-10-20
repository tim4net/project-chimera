# Nuaibria - Terminal UI

A vibrant Text User Interface (TUI) for Nuaibria, the AI-powered semi-idle RPG with a conversational Dungeon Master called "The Chronicler."

## Features

- **3-Column Layout**: Character stats, interactive world map, and chat interface
- **Vibrant Colors**: ANSI color-coded UI elements for visual appeal
- **Unicode Symbols**: Rich symbols for game elements (hearts, swords, biomes)
- **Conversational AI**: Natural language interaction with The Chronicler (AI DM)
- **Real-time Updates**: Live character stats, map exploration, and chat streaming
- **D&D 5e Mechanics**: Full support for abilities, skills, and combat

## Interface Layout

```
+-------------------+----------------------+-------------------+
|   CHARACTER       |      WORLD MAP       |   THE CHRONICLER  |
|   STATS           |                      |   (AI DM)         |
+-------------------+----------------------+-------------------+
| HP: [====    ] 40 | ~~~~ 🌊 ~~~~ 🌊 ~~~~ | > You stand at    |
| XP: 250/1000      | 🌲🌲🌲 🏰 🌲🌲🌲      | the edge of a     |
| Lvl: 3 Wizard     | 🌲 🌲 YOU 🌲 🌲      | dark forest...    |
| Pos: (12, 8)      | 🏔️🏔️🏔️ ⚔️ 🏔️🏔️🏔️   |                   |
|                   | 🏜️🏜️🏜️🏜️🏜️🏜️🏜️   | > What do you do? |
| STR: 10 (+0)      |                      |                   |
| DEX: 14 (+2)      |                      | _                 |
| CON: 12 (+1)      |                      +-------------------+
+-------------------+----------------------+
```

## Installation

```bash
# Navigate to CLI directory
cd cli

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Usage

### Starting the TUI

```bash
# Run with default settings (connects to http://localhost:3000)
npm start

# Or use custom backend URL
BACKEND_URL=http://your-backend:3000 npm start
```

### Controls

- **Type and Enter**: Send message to The Chronicler
- **Tab**: Cycle focus between panels
- **Shift+Tab**: Cycle focus backwards
- **Escape / q / Ctrl+C**: Quit application

### Playing the Game

The TUI is designed for natural language interaction:

```
> I want to explore the forest to the north
> I search for quests in the nearby town
> I cast fireball at the goblin
> What's in my inventory?
```

The Chronicler will narrate the outcomes, ask for clarifications, and update your character state in real-time.

## Configuration

### Environment Variables

- `BACKEND_URL`: Backend API URL (default: `http://localhost:3000`)

### Theme Customization

Edit `src/ui/theme.ts` to customize:
- Color scheme (ANSI colors)
- Unicode symbols
- UI element styles

## Architecture

### File Structure

```
cli/
├── src/
│   ├── index.ts              # Entry point
│   ├── ui/
│   │   ├── layout.ts         # Main layout manager
│   │   ├── characterPanel.ts # Left: character stats
│   │   ├── mapPanel.ts       # Center: world map
│   │   ├── chatPanel.ts      # Right: AI chat
│   │   └── theme.ts          # Colors & symbols
│   ├── api/
│   │   └── client.ts         # Backend API client
│   └── types/
│       └── index.ts          # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### Technology Stack

- **blessed**: Terminal UI framework with widgets
- **axios**: HTTP client for backend API
- **TypeScript**: Type-safe development
- **Node.js**: Runtime environment

## Development

### Watch Mode

```bash
# Auto-rebuild on file changes
npm run watch

# In another terminal
npm start
```

### Backend Integration

The TUI connects to the Nuaibria backend via REST API:

- `GET /api/characters/:id` - Fetch character data
- `GET /api/map` - Fetch world map
- `POST /api/chat` - Send message to The Chronicler
- `POST /api/chat/stream` - Stream AI responses (SSE)

## Design Philosophy

**Text-First, Map-Centric, Conversational**

Inspired by classic MUDs (Multi-User Dungeons) and modern AI systems, the TUI prioritizes:

1. **Natural Language**: Players describe actions conversationally
2. **AI Narration**: The Chronicler provides rich, immersive descriptions
3. **Visual Context**: Map and stats provide spatial awareness
4. **Minimalism**: No cluttered UIs, just essential information

## Troubleshooting

### Backend Connection Failed

Ensure the backend server is running:

```bash
# In project root
podman compose up -d
```

### Unicode Symbols Not Displaying

Your terminal must support UTF-8 and emoji:
- **Linux**: Most modern terminals support this
- **macOS**: Terminal.app and iTerm2 work well
- **Windows**: Use Windows Terminal (recommended)

### Colors Not Showing

Ensure your terminal supports 256 colors:

```bash
# Check color support
echo $TERM
# Should show: xterm-256color or similar
```

## Future Enhancements

- [ ] Multiplayer party view
- [ ] Combat turn-based overlay
- [ ] Inventory management screen
- [ ] Quest journal panel
- [ ] Character creation wizard
- [ ] Settings menu

## License

Part of Nuaibria - AI-Powered Semi-Idle RPG
