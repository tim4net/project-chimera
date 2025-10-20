#!/usr/bin/env python3
"""
Convert fetched monsters JSON to TypeScript files
"""

import json

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

def generate_ts_file(category_name, monsters, filename):
    """Generate a TypeScript file for a category"""

    header = f'''/**
 * D&D 5e SRD Monster Database - {category_name}
 *
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 * Used for encounter generation, combat resolution, and idle phase encounters.
 */

import {{ Monster }} from './monsters';

export const MONSTERS_{category_name.upper().replace(' ', '_').replace('-', '_')}: Record<string, Monster> = {{
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

    # Generate separate files for each CR category
    file_mapping = {
        'CR 0-2': 'monstersLowCR',
        'CR 3-5': 'monstersMidCR',
        'CR 6-10': 'monstersHighCR',
        'CR 11-15': 'monstersVeryHighCR',
        'CR 16-20': 'monstersEpicCR',
        'CR 21-30': 'monstersLegendaryCR'
    }

    for category, filename in file_mapping.items():
        if categories[category]:
            ts_content = generate_ts_file(category, categories[category], filename)
            output_path = f'/srv/project-chimera/backend/src/data/{filename}.ts'
            with open(output_path, 'w') as f:
                f.write(ts_content)
            print(f"Generated {output_path} with {len(categories[category])} monsters")

    print("\nDone! Generated TypeScript monster files.")

if __name__ == '__main__':
    main()
