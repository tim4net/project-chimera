#!/usr/bin/env python3
"""
Fetch D&D 5e SRD monsters from the API and organize by CR
Focus on CR 11+ and legendary creatures
"""

import requests
import json
import time
from typing import Dict, List, Any

API_BASE = "https://www.dnd5eapi.co/api/2014"

def fetch_monster_list() -> List[Dict[str, str]]:
    """Fetch the complete list of monsters"""
    response = requests.get(f"{API_BASE}/monsters")
    data = response.json()
    return data['results']

def fetch_monster_detail(index: str) -> Dict[str, Any]:
    """Fetch detailed monster data"""
    response = requests.get(f"{API_BASE}/monsters/{index}")
    return response.json()

def parse_monster(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert API data to our Monster format"""

    # Parse ability scores
    ability_scores = {
        'strength': data.get('strength', 10),
        'dexterity': data.get('dexterity', 10),
        'constitution': data.get('constitution', 10),
        'intelligence': data.get('intelligence', 10),
        'wisdom': data.get('wisdom', 10),
        'charisma': data.get('charisma', 10)
    }

    # Parse attacks
    attacks = []
    for action in data.get('actions', []):
        if action.get('attack_bonus'):
            damage_str = ""
            damage_type = ""

            if action.get('damage'):
                damages = action['damage']
                if damages:
                    first_damage = damages[0] if isinstance(damages, list) else damages
                    if isinstance(first_damage, dict):
                        damage_dice = first_damage.get('damage_dice', '')
                        damage_type = first_damage.get('damage_type', {}).get('name', '')
                        damage_str = damage_dice

            attacks.append({
                'name': action['name'],
                'attackBonus': action.get('attack_bonus', 0),
                'damage': damage_str,
                'damageType': damage_type,
                'description': action.get('desc', '')
            })

    # Parse special abilities
    special_abilities = []
    for ability in data.get('special_abilities', []):
        special_abilities.append({
            'name': ability['name'],
            'description': ability.get('desc', '')
        })

    # Parse legendary actions if present
    legendary_actions = []
    if data.get('legendary_actions'):
        for action in data['legendary_actions']:
            legendary_actions.append({
                'name': action['name'],
                'description': action.get('desc', ''),
                'cost': action.get('attack_bonus', 1)  # Default cost is 1
            })

    # Parse speed
    speed = {}
    if isinstance(data.get('speed'), dict):
        for key, value in data['speed'].items():
            if key != 'hover':
                speed[key] = value

    # Parse senses
    senses = {}
    if isinstance(data.get('senses'), dict):
        for key, value in data['senses'].items():
            if key != 'passive_perception':
                senses[key] = value
            else:
                senses['passive_perception'] = str(value)

    # Build monster object
    monster = {
        'index': data['index'],
        'name': data['name'],
        'size': data.get('size', 'Medium'),
        'type': data.get('type', 'unknown'),
        'alignment': data.get('alignment', 'unaligned'),
        'armorClass': data.get('armor_class', [{'value': 10}])[0]['value'],
        'hitPoints': data.get('hit_points', 10),
        'hitDice': data.get('hit_dice', '1d8'),
        'speed': speed,
        'abilityScores': ability_scores,
        'challengeRating': data.get('challenge_rating', 0),
        'proficiencyBonus': data.get('proficiency_bonus', 2),
        'xp': data.get('xp', 0),
        'attacks': attacks,
        'specialAbilities': special_abilities,
        'senses': senses,
        'languages': data.get('languages', ''),
        'damageVulnerabilities': [dv.get('name', dv) if isinstance(dv, dict) else dv
                                  for dv in data.get('damage_vulnerabilities', [])],
        'damageResistances': [dr.get('name', dr) if isinstance(dr, dict) else dr
                             for dr in data.get('damage_resistances', [])],
        'damageImmunities': [di.get('name', di) if isinstance(di, dict) else di
                            for di in data.get('damage_immunities', [])],
        'conditionImmunities': [ci.get('name', ci) if isinstance(ci, dict) else ci
                               for ci in data.get('condition_immunities', [])]
    }

    # Add subtype if present
    if data.get('subtype'):
        monster['subtype'] = data['subtype']

    # Add legendary actions if present
    if legendary_actions:
        monster['legendaryActions'] = legendary_actions

    return monster

def main():
    print("Fetching monster list...")
    monsters = fetch_monster_list()
    print(f"Found {len(monsters)} monsters")

    # Track which monsters we already have
    existing_monsters = [
        'awakened-shrub', 'giant-rat', 'giant-bat', 'stirge', 'kobold', 'goblin',
        'skeleton', 'zombie', 'wolf', 'cultist', 'bandit', 'guard', 'shadow',
        'dire-wolf', 'giant-spider', 'ghoul', 'imp', 'animated-armor',
        'orc', 'specter', 'brown-bear', 'black-bear', 'wight', 'quasit',
        'hobgoblin', 'bugbear', 'hell-hound', 'owlbear', 'basilisk', 'mimic',
        'cockatrice', 'flying-sword', 'awakened-tree', 'fire-elemental',
        'earth-elemental', 'young-red-dragon', 'young-black-dragon'
    ]

    # Organize monsters by CR category
    cr_categories = {
        'CR 0-2': [],
        'CR 3-5': [],
        'CR 6-10': [],
        'CR 11-15': [],
        'CR 16-20': [],
        'CR 21-30': []
    }

    count = 0
    target_count = 80  # Fetch 80 new monsters to reach 100+ total

    for monster_ref in monsters:
        if monster_ref['index'] in existing_monsters:
            continue

        if count >= target_count:
            break

        try:
            print(f"Fetching {monster_ref['name']}...")
            detail = fetch_monster_detail(monster_ref['index'])
            cr = detail.get('challenge_rating', 0)

            # Prioritize high CR and legendary creatures
            priority = False
            if cr >= 11:
                priority = True
            if detail.get('legendary_actions'):
                priority = True
            if 'dragon' in monster_ref['name'].lower() and cr >= 10:
                priority = True

            # Skip if low CR and we have enough of those
            if cr < 3 and count > 40:
                continue

            parsed = parse_monster(detail)

            # Categorize by CR
            if cr <= 2:
                category = 'CR 0-2'
            elif cr <= 5:
                category = 'CR 3-5'
            elif cr <= 10:
                category = 'CR 6-10'
            elif cr <= 15:
                category = 'CR 11-15'
            elif cr <= 20:
                category = 'CR 16-20'
            else:
                category = 'CR 21-30'

            cr_categories[category].append(parsed)
            count += 1

            # Be nice to the API
            time.sleep(0.1)

        except Exception as e:
            print(f"Error fetching {monster_ref['name']}: {e}")
            continue

    # Save to JSON for easy TypeScript conversion
    output = {
        'categories': cr_categories,
        'total_fetched': count,
        'stats': {cat: len(monsters) for cat, monsters in cr_categories.items()}
    }

    with open('/srv/project-chimera/scripts/fetched_monsters.json', 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nFetched {count} new monsters")
    print("\nBreakdown by CR:")
    for category, monster_list in cr_categories.items():
        print(f"  {category}: {len(monster_list)} monsters")

if __name__ == '__main__':
    main()
