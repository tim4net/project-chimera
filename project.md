**Project Chimera: Master Architectural Decision Records (ADRs)**

This document contains the complete collection of Architectural Decision Records for Project Chimera. Each ADR outlines a key design decision, its context, and its consequences.

**ADR-001: Hybrid AI and Web-Based Architecture**

**Status:** Active

**Context**

The core requirement is to build a semi-idle RPG powered by an AI Dungeon Master. This requires an architecture that is cost-effective, responsive, and capable of generating a creative and persistent narrative experience.

**Decision**

We will implement a hybrid architecture composed of four main pillars:

1.  **Hybrid AI Model:** We will use two types of Large Language Models (LLMs).

<!-- end list -->

  - A powerful, cloud-based model (**Gemini Pro**) for high-stakes creative tasks (e.g., major plot points, world generation).
  - A smaller, **local LLM** running on our own infrastructure for high-frequency, routine tasks (e.g., minor descriptions, NPC chatter).

<!-- end list -->

1.  **Backend Server:** A central server (e.g., Python/Flask or Node.js/Express) will manage all game logic, rules adjudication (5e mechanics), game state, and communication between the other components.
2.  **Database:** We will use **Supabase** as our primary database. Supabase is an open-source Firebase alternative that provides a powerful, scalable PostgreSQL database with built-in restful APIs. This choice allows us to:
    -   Directly interact with the database from our web and Discord frontends, reducing the need for a complex backend API for simple CRUD operations.
    -   Leverage Supabase's real-time capabilities to push updates to the clients.
    -   Utilize the self-hosted, containerized version of Supabase to keep all project data within the project's infrastructure.
3.  **Web-Based Frontend:** The primary user interface will be a web application (e.g., built with React) that displays the procedurally generated map, character sheets, and game logs.

**Consequences**

  - **Positive:** This approach is highly cost-effective by minimizing expensive API calls. It provides low latency for common actions and leverages the best qualities of both powerful and efficient AI models.
  - **Negative:** The infrastructure is more complex to set up and maintain than a purely cloud-based or purely local solution.

**ADR-002: Dual Interface with Discord Integration**

**Status:** Active

**Context**

Players need a convenient way to receive notifications and perform quick actions, especially during the asynchronous Idle Phase. A web-only interface might feel disconnected when players are away from the game.

**Decision**

We will implement a **Dual Interface** system:

1.  **The Web Application:** This remains the primary interface for visual and complex interactions: viewing the map, managing character sheets and inventory, and participating in tactical combat during the Active Phase.
2.  **The Discord Bot:** A dedicated bot will be integrated into a private Discord server for the players. Its roles are:

<!-- end list -->

  - **Notifications:** Pinging players when an Active Phase is triggered or their input is required.
  - **Information Hub:** Posting narrative updates from the AI DM to a dedicated \#journal channel.
  - **Command Interface:** Allowing players to set their Idle Phase tasks (e.g., /set-task travel) and interact with simple game systems directly from chat.

**Consequences**

  - **Positive:** Meets players where they are, leverages Discord's excellent notification and social features, and creates a seamless flow between active and idle play.
  - **Negative:** Requires development and maintenance of two separate frontends (the web app and the bot).

**ADR-003: Flexible Campaign and Party Structure**

**Status:** Active

**Context**

The game must support both solo and party-based multiplayer experiences within the same persistent world.

**Decision**

We will implement a two-tiered structure for game instances: **Campaigns** and **Parties**.

1.  **Campaign:** A single, unique game world defined by a procedural generation seed. All players in a campaign share the same map and history.
2.  **Party:** The core adventuring unit within a Campaign. A party can consist of one or more players. **A solo player is functionally treated as a "Party of one."** All game logic will be built to handle a Party object, unifying the development process.

The AI DM will dynamically scale the difficulty of encounters and challenges based on the size and composition of the Party it is interacting with.

**Consequences**

  - **Positive:** Offers maximum flexibility for players to play solo or with friends. A single world can host multiple concurrent adventures. Backend logic is unified.
  - **Negative:** Dynamically balancing content via an LLM is a difficult challenge that will require extensive prompt engineering and testing.

**ADR-004: Player and Party Interaction**

**Status:** Active

**Context**

With multiple parties potentially active in one campaign, a system is needed for them to find, communicate with, and join each other if they choose.

**Decision**

We will implement a multi-layered system for party interaction:

1.  **Player Directory:** A directory within the UI will show all active parties, their members, and their general region (e.g., "The Sunstone Desert") to let players know who else is in the world.
2.  **Invitation System:** A party can directly invite another player or party. Accepting the invitation does not teleport them; instead, it creates a quest marker on their map, turning the act of meeting into a "journey to rendezvous."
3.  **In-Game Social Hubs:** Players can use actions in settlements like Post a Public Notice or Gather Rumors to create and discover organic, diegetic hooks to meet other players.

**Consequences**

  - **Positive:** Facilitates both direct and organic multiplayer interactions. Merging parties becomes an in-world adventure.
  - **Negative:** Adds complexity to the UI and social systems.

**ADR-005: Lore-Driven Portal System**

**Status:** Active

**Context**

A vast, procedurally generated world requires a form of fast travel to respect players' time, but it must be implemented in a way that does not trivialize exploration or the scale of the world.

**Decision**

We will implement a limited, lore-driven portal network controlled by a specific faction, **"The Veiled Wayfarers."**

1.  **Discovery:** Players must first physically travel to a portal to "attune" to it, adding it to their known network.
2.  **Daily Limit:** Each player can use the portal network once per real-world day.
3.  **Consumable Bypass:** A rare, expensive, or quest-rewarded potion ("Draught of Displacement") can be consumed to bypass the daily cooldown for a single trip.
4.  **Faction Control:** Portals are only found in settlements with a Veiled Wayfarers enclave, making them a key quest-giving faction.

**Consequences**

  - **Positive:** Adds a deep strategic layer to travel decisions. Creates new questlines and makes portal towns valuable hubs.
  - **Negative:** Restricts player convenience, which may be frustrating for those who prefer unrestricted fast travel.

**ADR-006: Dual-Model 5e Mechanics**

**Status:** Active

**Context**

A direct, 1:to:1 translation of the D\&D 5e ruleset is too complex and slow for a semi-idle game. The mechanics must be adapted to fit the game's two distinct phases.

**Decision**

We will adopt a **Dual-Model System** for rules adjudication:

1.  **The Idle Phase ("Abstract" Model):** All actions are resolved as single, background skill checks (d20 + mods vs. DC). Minor combat encounters are abstracted into a single roll comparing the party's "Combat Power Rating" to the enemy's.
2.  **The Active Phase ("Tactical" Model)::** Major encounters use an **asynchronous turn-based combat system**. Players are notified when it is their turn and choose from a simplified list of actions (Attack, Cast Spell, Use Skill, Use Item).

**Consequences**

  - **Positive:** Preserves the spirit of 5e while ensuring the Idle Phase is fast and the Active Phase is tactical and engaging.
  - **Negative:** Requires balancing two separate systems. The abstracted idle combat may feel less satisfying for players who enjoy tactical crunch.

**ADR-007: Tiered NPC and Conversation Management Protocol**

**Status:** Active (Revised)

**Context**

The world needs a system for managing NPCs and their interactions that is both narratively robust and cost-effective, efficiently using our hybrid AI architecture.

**Decision**

We will implement a tiered NPC system combined with a **Conversation Management Protocol** for the most important characters.

1.  **NPC Tiers:** NPCs are categorized as Generic (handled by local LLM), Notable (local LLM with specific data), and Major (story-drivers).
2.  **Conversation Protocol for Major NPCs:**

<!-- end list -->

  - **Persona Document:** Upon creation, **Gemini Pro** generates a detailed "Persona Document" (motivations, personality, speech patterns) for the NPC, which is stored in the database.
  - **Memory Log:** After every conversation, the handling LLM appends a summary to a persistent "Memory Log."
  - **Handoff Mechanism:** **Gemini Pro** handles the first contact and critical story beats. The **Local LLM**, prompted with the Persona Document and Memory Log, handles all subsequent, routine conversations.

**Consequences**

  - **Positive:** Drastically reduces API costs for the premium model. Ensures high consistency and accurate memory for key characters.
  - **Negative:** Increases database load and requires complex prompt engineering to ensure seamless handoffs.

**ADR-008: Multi-Vector Character Progression**

**Status:** Active

**Context**

A compelling character progression system is required to motivate players and reward a variety of playstyles beyond simple combat.

**Decision**

We will implement a **Multi-Vector Progression System** with four interconnected paths:

1.  **Experience and Leveling:** The core 5e path of earning XP from all activities to gain levels and class features.
2.  **Loot and Equipment:** Acquiring gear, including unique items with **AI-generated properties** to make loot exciting and unpredictable.
3.  **Reputation:** Gaining standing with factions to unlock new quests, vendors, and access to restricted areas.
4.  **Knowledge:** Discovering new crafting recipes and lore to expand a character's utility and understanding of the world.

**Consequences**

  - **Positive:** Rewards all playstyles (combat, social, exploration, crafting). Deeply integrated with other game systems. High replayability.
  - **Negative:** Balancing four progression vectors is significantly more complex than balancing XP alone.

**ADR-009: Layered Quest Generation System**

**Status:** Active

**Context**

With the world, mechanics, and progression systems defined, a method for generating the actual adventures, or "quests," is required. The system must be capable of producing a wide variety of content, from simple, repeatable tasks to complex, narrative-driven epics, while efficiently using our hybrid AI architecture.

**Decision**

We will implement a **Layered Quest Generation System** to create a diverse and dynamic stream of adventures.

1.  **Layer 1: Template-Based Radiant Quests:** A library of simple quest templates (e.g., fetch, clear, scout) will be used by the **Local LLM**. These templates are filled in procedurally using nearby Points of Interest (POIs) and Notable NPCs, providing a near-endless supply of basic adventures suitable for idle play.
2.  **Layer 2: Faction-Driven Procedural Quests:** The AI DM will monitor the world state (e.g., faction tensions, resource scarcities) and generate more complex, multi-step quests in response. This creates emergent narratives tied to the evolving state of the world.
3.  **Layer 3: Major Story Arcs:** During world creation, **Gemini Pro** will be tasked with generating several high-concept, epic story outlines for the campaign. The AI DM uses these outlines as a guide to seed clues and drive the main narrative forward through interactions with Major NPCs and key Active Phase events.

**Consequences**

**Positive:**

  - **Endless Content:** The combination of radiant and procedural systems ensures players will never run out of things to do.
  - **Narrative Cohesion:** The Major Story Arcs provide a central, compelling narrative backbone, preventing the game from feeling like a disconnected series of random tasks.
  - **Efficient AI Use:** The system correctly delegates tasks: the local LLM handles high-volume, low-complexity quest generation, while Gemini Pro is reserved for high-impact, creative narrative design.
  - **Dynamic World:** Faction-driven quests make the world feel alive and responsive to events, rather than static.

**Negative:**

  - **Template Repetitiveness:** If not managed carefully, the Layer 1 radiant quests could become repetitive. A large and varied template library will be necessary.
  - **Story Pacing:** The AI DM will need sophisticated logic to know when to introduce hooks for the Major Story Arcs without overwhelming the players or railroading them.

**ADR-010: Character Creation and Onboarding**

**Status:** Active

**Context**

A new player's first experience with the game is critical. A clear, engaging, and informative onboarding process is needed to introduce them to character creation, the unique semi-idle gameplay loop, and the dual interface system.

**Decision**

We will implement a **Narrative-Driven Onboarding Process** that integrates character creation directly into a tutorial quest.

1.  **Guided Character Creation:** The process will be a step-by-step wizard in the web application. It will use a standard 5e Point-Buy system for ability scores and allow players to choose from a curated list of races and classes to ensure a balanced starting experience. The AI will provide thematic descriptions for each choice.
2.  **Personalized Opening Scene:** Once the character is created, **Gemini Pro** will be used for a one-time call to generate a unique, personalized opening scene. The prompt will include the character's class, race, and background to create a compelling narrative hook that places them in their starting location.

<!-- end list -->

  - *Example:* A Rogue might have an intro about a heist gone wrong, while a Cleric's might describe a vision from their deity.

<!-- end list -->

1.  **Integrated Tutorial Quest:** All new players (or parties) will begin with an "Onboarding" quest. This quest is designed to teach the core mechanics organically:

<!-- end list -->

  - The first objective will require them to use the Discord bot to set an idle task (e.g., /set-task scout the area).
  - This task will automatically trigger a simple Active Phase event (e.g., "You find a wounded wolf").
  - Resolving this event will guide them to their first town and introduce them to a Notable NPC, concluding the tutorial.

**Consequences**

**Positive:**

  - **Engaging Introduction:** Avoids boring tutorial pop-ups by teaching mechanics through story.
  - **Strong First Impression:** The personalized opening scene from Gemini Pro immediately showcases the game's unique AI-driven narrative potential.
  - **Clear Guidance:** Ensures players understand the core gameplay loop (Idle -\> Active -\> Resolution) within their first session.

**Negative:**

  - **Development Overhead:** A guided, narrative tutorial is more complex to build than a simple text-based guide.
  - **One-time Gemini Cost:** While efficient, this design dedicates a Gemini Pro API call to every new character, which is a defined, upfront "acquisition cost."

**ADR-011: Core UI/UX Flow for the Web Application**

**Status:** Active (Revised)

**Context**

With all backend and game systems defined, a clear and intuitive user interface is needed. The design should prioritize a text-first, minimalist aesthetic reminiscent of classic Multi-User Dungeons (MUDs), where the AI's narrative is the primary focus. The web application is the primary interface for complex interactions, serving as the game's "cockpit."

**Decision**

We will structure the web UI around a **central dashboard** and several dedicated screens, guided by a "Text-First, Map-Centric" philosophy.

1.  **Guiding Principle: Text-First, Map-Centric Design.** The UI will be minimalist, prioritizing readable text and the interactive map over extraneous graphics. The AI-generated narrative is the star of the show, and the UI's role is to present it clearly and provide unambiguous controls.
2.  **The Main Dashboard (The "Cockpit View"):** This is the default view upon logging in. It will be dominated by the **interactive map**. A persistent sidebar will display a clean, highly readable feed of the latest journal entries and the current status of the party.
3.  **Character Screen (The "Hero Panel"):** A dedicated, full-screen view presented as a clean, data-focused sheet. It will use tabs to organize character data:

<!-- end list -->

  - **Stats & Skills:** Core ability scores and skill proficiencies.
  - **Inventory & Equipment:** A visual, drag-and-drop interface for managing gear.
  - **Abilities & Spells:** A list of all class features and a spellbook for casters.
  - **Reputation:** A list of all known factions and the party's current standing with each.

<!-- end list -->

1.  **Journal Screen (The "Chronicle"):** An expanded, searchable archive of every narrative entry from the AI DM.
2.  **Social Screen (The "Tavern"):** This screen will house the Player Directory, party management tools, and the invitation system.
3.  **Active Phase Overlay:** When an Active Phase is triggered, a non-intrusive **modal overlay** will appear. This overlay will feature the AI's narrative text prominently, followed by a clean set of interactive buttons for the "Choice Matrix."

**Consequences**

**Positive:**

  - **Intuitive Navigation:** The design provides a clear, logical path to all major game functions.
  - **Focus on Narrative:** The minimalist aesthetic ensures the AI's storytelling is never overshadowed by the UI.
  - **Clear Development Path:** This ADR provides a clear blueprint for the frontend development team.

**Negative:**

  - **Significant Frontend Scope:** Designing and building a polished, multi-screen web application is a substantial undertaking.
  - **Responsive Design Challenges:** Ensuring this interface works well on a variety of screen sizes will require careful planning.

**ADR-012: World Evolution and the Epoch System**

**Status:** Active

**Context**

A persistent world needs to feel the impact of player actions over the long term. Major story victories should result in tangible, permanent changes to the campaign world, providing a sense of lasting accomplishment and creating a living history.

**Decision**

We will implement a **World Epoch System** to create a dynamically evolving world history.

1.  **Epoch Trigger:** An "Epoch Event" is triggered when a party successfully completes a Layer 3 Major Story Arc (from ADR-009).
2.  **Historical Record Generation:** Upon the trigger, **Gemini Pro** is tasked with a high-level creative prompt: "The heroes have defeated the Dragon of Mount Cinder. Write a short, historical summary of this event and describe the immediate aftermath and long-term consequences for the surrounding region." This summary is added to a permanent, viewable "Campaign Chronicle."
3.  **Permanent World Changes:** The backend server will then execute a series of pre-defined changes to the world state based on the completed arc.

<!-- end list -->

  - **Map Changes:** The icon for Mount Cinder might change from a "Lair" to a "Conquered Dungeon." New POIs, like a "Dragon-bone Mine" or a "Freed Village," might appear nearby.
  - **Faction & NPC Changes:** The reputation of the victorious party with the local kingdom skyrockets. A new Major NPC, "The Dragonslayer," might become available for interaction.
  - **New Quest Generation:** The system will seed new Faction-Driven (Layer 2) and Radiant (Layer 1) quests related to the new world state (e.g., "Help rebuild the villages," "Mine the valuable dragon bones," "Clear out the remaining dragon cultists").

<!-- end list -->

1.  **Endgame Content:** For high-level parties who have completed one or more Epoch Events, new sandbox-style "endgame" systems will become available, such as building a stronghold, founding a guild, or taking a direct role in faction politics.

**Consequences**

**Positive:**

  - **Player Legacy:** This system provides the ultimate reward: a permanent, positive impact on the game world that all other players can see.
  - **Dynamic Narrative:** The world's story doesn't end; it evolves. The consequences of one story arc become the foundation for the next.
  - **Long-Term Engagement:** Provides a compelling endgame loop focused on creation and influence rather than just combat.
  - **Efficient AI Use:** Reserves our most powerful AI for the most impactful moments—crystallizing history.

**Negative:**

  - **Content Complexity:** Designing story arcs that have meaningful, implementable world-state changes is a significant design challenge.
  - **Potential for "Empty" Worlds:** If a campaign runs for a very long time, it's possible for players to "complete" all the major arcs, requiring the addition of new ones over time.

**ADR-013: Minimum Viable Product (MVP) Definition**

**Status:** Proposed

**Context**

The full design of Project Chimera is comprehensive and complex. To begin development, we need to define a smaller, core feature set that is achievable in a reasonable timeframe and can serve as a foundation for future iteration. This is the Minimum Viable Product (MVP).

**Decision**

The MVP will focus exclusively on the **core solo player experience** to prove the viability of the central gameplay loop. The feature set will be strictly limited to the following:

1.  **Core Infrastructure:**

<!-- end list -->

  - A functioning backend server.
  - A database that can store and manage a single player's character data.

<!-- end list -->

1.  **Onboarding:**

<!-- end list -->

  - The guided character creation wizard (ADR-010).
  - The one-time Gemini Pro call for a personalized opening scene.

<!-- end list -->

1.  **Primary Interface:**

<!-- end list -->

  - A web UI that displays the procedurally generated map with Fog of War.
  - A basic, real-time journal feed on the main dashboard.

<!-- end list -->

1.  **Core Gameplay Loop:**

<!-- end list -->

  - The ability to set two Idle Phase tasks: Travel and Scout (ADR-006).
  - A functional Active Phase system with the modal overlay and Choice Matrix (ADR-011).
  - Implementation of only Layer 1, Template-Based Radiant Quests (ADR-009).

<!-- end list -->

1.  **AI Integration:**

<!-- end list -->

  - Integration of the local LLM to narrate travel, scouting results, and radiant quest outcomes.
  - The single, fire-and-forget Gemini Pro call during onboarding.

<!-- end list -->

1.  **Progression:**

<!-- end list -->

  - Characters can earn XP from exploration and questing.
  - Characters can find basic, non-magical loot.
  - A simple, functional leveling-up system.

**Explicitly Excluded from the MVP:**

  - All multiplayer and party systems (ADR-003, ADR-004).
  - The Portal System (ADR-005).
  - Faction, Reputation, and Major NPC systems (ADR-007).
  - The World Epoch and endgame systems (ADR-012).
  - The majority of Idle Phase tasks (crafting, foraging, etc.).
  - The Discord Bot (to focus all initial frontend effort on the primary web UI).
  - AI-generated loot properties.

**Consequences**

**Positive:**

  - **Clear Focus:** Provides a clear, achievable, and testable goal for the initial development phase.
  - **Early Validation:** Allows us to test and validate the core gameplay loop (explore -\> find quest -\> resolve quest -\> get reward) as quickly as possible.
  - **Reduces Initial Complexity:** Postpones the most complex systems (multiplayer, advanced AI memory) to a later stage.

**Negative:**

  - **Limited Experience:** The MVP will lack the depth and long-term engagement of the full design.
  - **No Social Features:** The initial version will not represent the final multiplayer vision for the game.

**ADR-014: Self-Hosted Supabase Container**

**Status:** Active

**Context**

To align with the project's goal of a self-contained, portable infrastructure, and to leverage the powerful features of Supabase as defined in ADR-001, a decision is needed on how to integrate it into the project.

**Decision**

We will use the official, open-source, self-hosted version of Supabase, running it as a Docker container within the project's infrastructure. This approach involves managing the Supabase stack (PostgreSQL, GoTrue, PostgREST, etc.) via `docker-compose`.

**Consequences**

**Positive:**

  - **Full Control & Data Ownership:** All data remains within the project's local environment, ensuring privacy and control.
  - **Cost-Effective:** Avoids the costs associated with a managed, cloud-hosted database service.
  - **Development Parity:** Ensures the development environment perfectly mirrors the future production environment.
  - **Portable:** The entire game, including its database, can be easily packaged and run anywhere Docker is installed.

**Negative:**

  - **Increased Maintenance Overhead:** We are responsible for the maintenance, updates, and security of the Supabase container.
  - **Resource Consumption:** Running the full Supabase stack locally will consume more system resources (RAM, CPU) than connecting to a remote database.