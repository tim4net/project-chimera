#!/usr/bin/env python3
"""
Split large monster files into smaller chunks (<300 lines each)
"""

import json
import os

def format_monster_ts(monster):
    """Format a single monster as TypeScript code"""

    # Format speed
    speed_entries = [f'{k}: "{v}"' for k, v in monster['speed'].items()]
    speed_str = '{ ' + ', '.join(speed_entries) + ' }'

    # Format ability scores
    ability_str = f'''{{
      strength: {monster['abilityScores']['strength']},
      dexterity: {monster['abilityScores']['dexterity']},
      constitution: {monster['abilityScores']['constitution']},
      intelligence: {monster['abilityScores']['intelligence']},
      wisdom: {monster['abilityScores']['wisdom']},
      charisma: {monster['abilityScores']['charisma']}
    }}'''

    # Format attacks
    attacks_list = []
    for attack in monster['attacks']:
        desc = attack['description'].replace('"', '\\"').replace('\n', ' ')
        attacks_list.append(f'''      {{
        name: "{attack['name']}",
        attackBonus: {attack['attackBonus']},
        damage: "{attack['damage']}",
        damageType: "{attack['damageType']}",
        description: "{desc}"
      }}''')
    attacks_str = '[\n' + ',\n'.join(attacks_list) + '\n    ]' if attacks_list else '[]'

    # Format special abilities
    abilities_list = []
    for ability in monster['specialAbilities']:
        desc = ability['description'].replace('"', '\\"').replace('\n', ' ')
        abilities_list.append(f'''      {{
        name: "{ability['name']}",
        description: "{desc}"
      }}''')
    abilities_str = '[\n' + ',\n'.join(abilities_list) + '\n    ]' if abilities_list else '[]'

    # Format legendary actions if present
    legendary_str = ''
    if monster.get('legendaryActions'):
        legendary_list = []
        for action in monster['legendaryActions']:
            desc = action['description'].replace('"', '\\"').replace('\n', ' ')
            legendary_list.append(f'''      {{
        name: "{action['name']}",
        description: "{desc}",
        cost: {action.get('cost', 1)}
      }}''')
        legendary_str = ',\n    legendaryActions: [\n' + ',\n'.join(legendary_list) + '\n    ]'

    # Format senses
    senses_entries = [f'{k}: "{v}"' for k, v in monster['senses'].items()]
    senses_str = '{ ' + ', '.join(senses_entries) + ' }' if senses_entries else '{}'

    # Format arrays
    def format_array(arr):
        if not arr:
            return '[]'
        items = [f'"{item}"' for item in arr]
        return '[' + ', '.join(items) + ']'

    vuln_str = format_array(monster['damageVulnerabilities'])
    resist_str = format_array(monster['damageResistances'])
    immune_str = format_array(monster['damageImmunities'])
    cond_immune_str = format_array(monster['conditionImmunities'])

    # Build the monster entry
    subtype_line = f',\n    subtype: "{monster["subtype"]}"' if monster.get('subtype') else ''

    return f'''  "{monster['index']}": {{
    index: "{monster['index']}",
    name: "{monster['name']}",
    size: "{monster['size']}",
    type: "{monster['type']}"{subtype_line},
    alignment: "{monster['alignment']}",
    armorClass: {monster['armorClass']},
    hitPoints: {monster['hitPoints']},
    hitDice: "{monster['hitDice']}",
    speed: {speed_str},
    abilityScores: {ability_str},
    challengeRating: {monster['challengeRating']},
    proficiencyBonus: {monster['proficiencyBonus']},
    xp: {monster['xp']},
    attacks: {attacks_str},
    specialAbilities: {abilities_str},
    senses: {senses_str},
    languages: "{monster['languages']}",
    damageVulnerabilities: {vuln_str},
    damageResistances: {resist_str},
    damageImmunities: {immune_str},
    conditionImmunities: {cond_immune_str}{legendary_str}
  }}'''

def count_lines(monster):
    """Estimate line count for a monster"""
    return len(format_monster_ts(monster).split('\n'))

def split_into_chunks(monsters, max_lines=250):
    """Split monsters into chunks that won't exceed max_lines"""
    chunks = []
    current_chunk = []
    current_lines = 20  # Header overhead

    for monster in monsters:
        monster_lines = count_lines(monster)
        if current_lines + monster_lines > max_lines and current_chunk:
            chunks.append(current_chunk)
            current_chunk = [monster]
            current_lines = 20 + monster_lines
        else:
            current_chunk.append(monster)
            current_lines += monster_lines

    if current_chunk:
        chunks.append(current_chunk)

    return chunks

def generate_ts_file(part_name, monsters, export_name):
    """Generate a TypeScript file for a chunk"""

    header = f'''/**
 * D&D 5e SRD Monster Database - {part_name}
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import {{ Monster }} from './monsters';

export const {export_name}: Record<string, Monster> = {{
'''

    monster_entries = [format_monster_ts(m) for m in monsters]
    body = ',\n\n'.join(monster_entries)

    footer = '''
};
'''

    return header + body + footer

def main():
    # Load fetched monsters
    with open('/srv/project-chimera/scripts/fetched_monsters.json', 'r') as f:
        data = json.load(f)

    categories = data['categories']

    # Process each category and split if needed
    for category, monsters in categories.items():
        if not monsters:
            continue

        # Split into chunks
        chunks = split_into_chunks(monsters, max_lines=250)

        # Generate base filename
        if category == 'CR 0-2':
            base_name = 'monstersLowCR'
        elif category == 'CR 3-5':
            base_name = 'monstersMidCR'
        elif category == 'CR 6-10':
            base_name = 'monstersHighCR'
        elif category == 'CR 11-15':
            base_name = 'monstersVeryHighCR'
        elif category == 'CR 16-20':
            base_name = 'monstersEpicCR'
        elif category == 'CR 21-30':
            base_name = 'monstersLegendaryCR'

        # Generate files for each chunk
        if len(chunks) == 1:
            # Single file
            ts_content = generate_ts_file(
                category,
                chunks[0],
                base_name.replace('monsters', 'MONSTERS_').upper()
            )
            output_path = f'/srv/project-chimera/backend/src/data/{base_name}.ts'
            with open(output_path, 'w') as f:
                f.write(ts_content)
            print(f"Generated {base_name}.ts ({len(monsters)} monsters)")
        else:
            # Multiple files
            for i, chunk in enumerate(chunks, 1):
                part_name = f"{category} Part {i}"
                file_name = f"{base_name}Part{i}"
                export_name = file_name.replace('monsters', 'MONSTERS_').upper()

                ts_content = generate_ts_file(part_name, chunk, export_name)
                output_path = f'/srv/project-chimera/backend/src/data/{file_name}.ts'
                with open(output_path, 'w') as f:
                    f.write(ts_content)
                print(f"Generated {file_name}.ts ({len(chunk)} monsters)")

    print("\nDone! Split monster files to stay under 300 lines each.")

if __name__ == '__main__':
    main()
