/**
 * Fantasy Name Generator - Race and Gender Aware
 * Generates appropriate names based on D&D race and character gender
 */

type Gender = 'male' | 'female' | 'nonbinary';
type Race = 'Human' | 'Elf' | 'Dwarf' | 'Halfling' | 'Dragonborn' | 'Gnome' | 'Half-Elf' | 'Half-Orc' | 'Tiefling';

const NAME_LISTS = {
  Human: {
    male: {
      first: ['Aldric', 'Bran', 'Cedric', 'Darius', 'Evander', 'Fenris', 'Gareth', 'Hadrian', 'Ignatius', 'Joren', 'Kaelith', 'Lorian', 'Malachai', 'Nyx', 'Orion', 'Percival', 'Quintus', 'Raeth', 'Severin', 'Theron', 'Ulrich', 'Vesper', 'Wulfric', 'Xandros', 'Zephyr'],
      last: ['Darkbane', 'Emberstorm', 'Frostwhisper', 'Grimward', 'Hallowmere', 'Ironveil', 'Nightshade', 'Ravenholme', 'Shadowmend', 'Starcaller', 'Thornwraith', 'Voidwalker', 'Winterfang', 'Wyrmwood', 'Ashenfall'],
    },
    female: {
      first: ['Aeliana', 'Brynn', 'Celestia', 'Delphine', 'Elara', 'Faenya', 'Gwyneth', 'Helera', 'Isolde', 'Jessamine', 'Kalista', 'Lyanna', 'Melisande', 'Nerissa', 'Ophelia', 'Petra', 'Quendra', 'Ravenna', 'Selene', 'Thalia', 'Ulara', 'Vesryn', 'Winterra', 'Xylara', 'Zephyra'],
      last: ['Darkbane', 'Emberstorm', 'Frostwhisper', 'Grimward', 'Hallowmere', 'Ironveil', 'Nightshade', 'Ravenholme', 'Shadowmend', 'Starcaller', 'Thornwraith', 'Voidwalker', 'Winterfang', 'Wyrmwood', 'Ashenfall'],
    },
    nonbinary: {
      first: ['Ash', 'Crow', 'Dusk', 'Echo', 'Ember', 'Frost', 'Ghost', 'Haven', 'Myst', 'Onyx', 'Phoenix', 'Raven', 'Shade', 'Storm', 'Vesper', 'Whisper', 'Wraith'],
      last: ['Darkbane', 'Emberstorm', 'Shadowmend', 'Starcaller', 'Voidwalker', 'Winterfang'],
    },
  },

  Elf: {
    male: {
      first: ['Aelrindel', 'Belisar', 'Caladrel', 'Ellandor', 'Erevan', 'Faelynor', 'Galanodel', 'Helianthus', 'Ivellios', 'Jorildyn', 'Kylaros', 'Laeroth', 'Mirathiel', 'Naerynth', 'Olarys', 'Phaendar', 'Quillathe', 'Rhistel', 'Soveliss', 'Tharivol', 'Utharn', 'Vaelstrider', 'Windel'],
      last: ['Amastacia', 'Moonwhisper', 'Starweaver', 'Silversong', 'Nightbloom', 'Evenstar', 'Mythweaver', 'Dawnstrider', 'Spellwhisper', 'Shadowleaf', 'Crystalwing', 'Etherealwind'],
    },
    female: {
      first: ['Aelynthi', 'Celestara', 'Dreamweaver', 'Elendra', 'Faeloria', 'Gwethalyn', 'Ielenia', 'Keyleth', 'Lirazel', 'Melandriel', 'Naivara', 'Phaedra', 'Quelenna', 'Raelia', 'Sariel', 'Thalindra', 'Valanthe', 'Xiloscient', 'Yrathiel', 'Zephyria'],
      last: ['Amastacia', 'Moonwhisper', 'Starweaver', 'Silversong', 'Nightbloom', 'Evenstar', 'Mythweaver', 'Dawnstrider', 'Spellwhisper', 'Shadowleaf', 'Crystalwing', 'Etherealwind'],
    },
    nonbinary: {
      first: ['Aeris', 'Caelan', 'Elarion', 'Nyxara', 'Sylvaris', 'Thalion', 'Valeris'],
      last: ['Moonwhisper', 'Starweaver', 'Evenstar', 'Mythweaver', 'Shadowleaf'],
    },
  },

  Dwarf: {
    male: {
      first: ['Baern', 'Brottor', 'Bruenor', 'Dain', 'Eberk', 'Fargrim', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik', 'Rangrim', 'Taklinn', 'Thoradin', 'Thorin', 'Tordek', 'Traubon', 'Ulfgar', 'Veit', 'Vondal', 'Grimforge', 'Ironhelm', 'Stonebreaker'],
      last: ['Battlehammer', 'Ironforge', 'Stonehelm', 'Thunderaxe', 'Goldheart', 'Steelshield', 'Deepdelver', 'Runekeeper', 'Flamebrand', 'Anvilstrike', 'Stonefury', 'Mountainborn', 'Earthshaker'],
    },
    female: {
      first: ['Amber', 'Artin', 'Audhild', 'Bardryn', 'Dagnal', 'Diesa', 'Eldeth', 'Falkrunn', 'Finellen', 'Gunnloda', 'Gurdis', 'Helja', 'Hlin', 'Kathra', 'Kristryd', 'Ilde', 'Liftrasa', 'Mardred', 'Riswynn', 'Sannl', 'Torbera', 'Torgga', 'Vistra', 'Brunhilde', 'Helga'],
      last: ['Battlehammer', 'Ironforge', 'Stonehelm', 'Thunderaxe', 'Goldheart', 'Steelshield', 'Deepdelver', 'Runekeeper', 'Flamebrand', 'Anvilstrike', 'Stonefury', 'Mountainborn', 'Earthshaker'],
    },
    nonbinary: {
      first: ['Bran', 'Durn', 'Grim', 'Krag', 'Thur', 'Rune', 'Steel'],
      last: ['Stonehelm', 'Ironforge', 'Runekeeper', 'Mountainborn'],
    },
  },

  Halfling: {
    male: {
      first: ['Alton', 'Ander', 'Bernie', 'Bobbin', 'Cade', 'Callus', 'Corrin', 'Dannad', 'Errich', 'Finnan', 'Garret', 'Lindal', 'Lyle', 'Merric', 'Milo', 'Osborn', 'Perrin', 'Reed', 'Roscoe', 'Wellby'],
      last: ['Brushgather', 'Goodbarrel', 'Greenbottle', 'Highhill', 'Hilltopple', 'Leagallow', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough'],
    },
    female: {
      first: ['Andry', 'Bree', 'Callie', 'Cora', 'Dee', 'Eida', 'Euphemia', 'Georgina', 'Lavinia', 'Lidda', 'Merla', 'Nedda', 'Paela', 'Portia', 'Seraphina', 'Shaena', 'Trym', 'Vani', 'Verna'],
      last: ['Brushgather', 'Goodbarrel', 'Greenbottle', 'Highhill', 'Hilltopple', 'Leagallow', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough'],
    },
    nonbinary: {
      first: ['Pip', 'Robin', 'Clover', 'Fern', 'Wren', 'Bramble'],
      last: ['Goodbarrel', 'Tealeaf', 'Hilltopple'],
    },
  },

  Dragonborn: {
    male: {
      first: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash', 'Mehen', 'Nadarr', 'Pandjed', 'Patrin', 'Rhogar', 'Shamash', 'Shedinn', 'Tarhun', 'Torinn'],
      last: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Fenkenkabradon', 'Kerrhylon', 'Kimbatuul', 'Linxakasendalor', 'Myastan', 'Nemmonis', 'Norixius', 'Ophinshtalajiir', 'Prexijandilin', 'Shestendeliath', 'Turnuroth', 'Verthisathurgiesh'],
    },
    female: {
      first: ['Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Havilar', 'Jheri', 'Kava', 'Korinn', 'Mishann', 'Nala', 'Perra', 'Raiann', 'Sora', 'Surina', 'Thava', 'Uadjit'],
      last: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Kerrhylon', 'Kimbatuul', 'Myastan', 'Nemmonis', 'Turnuroth'],
    },
    nonbinary: {
      first: ['Zar', 'Keth', 'Vax', 'Thral'],
      last: ['Daardendrian', 'Kerrhylon'],
    },
  },

  Gnome: {
    male: {
      first: ['Alston', 'Alvyn', 'Boddynock', 'Brocc', 'Burgell', 'Dimble', 'Eldon', 'Erky', 'Fonkin', 'Frug', 'Gerbo', 'Gimble', 'Glim', 'Jebeddo', 'Kellen', 'Namfoodle', 'Orryn', 'Roondar', 'Seebo', 'Sindri', 'Warryn', 'Wrenn', 'Zook'],
      last: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel', 'Raulnor', 'Scheppen', 'Turen'],
    },
    female: {
      first: ['Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Duvamil', 'Ella', 'Ellyjobell', 'Ellywick', 'Lilli', 'Loopmottin', 'Lorilla', 'Mardnab', 'Nissa', 'Nyx', 'Oda', 'Orla', 'Roywyn', 'Shamil', 'Tana', 'Waywocket', 'Zanna'],
      last: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel', 'Raulnor', 'Scheppen', 'Turen'],
    },
    nonbinary: {
      first: ['Nim', 'Pip', 'Zix', 'Quin', 'Fizz'],
      last: ['Nackle', 'Turen', 'Garrick'],
    },
  },

  'Half-Elf': {
    male: {
      first: ['Aelrindel', 'Bran', 'Caladrel', 'Darius', 'Erik', 'Finn', 'Galanodel', 'Hector', 'Ivellios', 'Kael', 'Lucan', 'Marcus', 'Naerth', 'Owen', 'Percival'],
      last: ['Greyhaven', 'Moonbrook', 'Starling', 'Thorngage', 'Willowshade', 'Ashwood', 'Riverrun'],
    },
    female: {
      first: ['Aerith', 'Birel', 'Caelynn', 'Diana', 'Elara', 'Freya', 'Gwethana', 'Helena', 'Ielenia', 'Keyleth', 'Lyra', 'Meriele', 'Nessa', 'Quelenna', 'Seraphina', 'Thalia', 'Valanthe'],
      last: ['Greyhaven', 'Moonbrook', 'Starling', 'Thorngage', 'Willowshade', 'Ashwood', 'Riverrun'],
    },
    nonbinary: {
      first: ['Ash', 'River', 'Sage', 'Sky', 'Rowan'],
      last: ['Greyhaven', 'Moonbrook', 'Willowshade'],
    },
  },

  'Half-Orc': {
    male: {
      first: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk', 'Mhurren', 'Ront', 'Shump', 'Thokk', 'Grak', 'Throk', 'Urg', 'Vrokk'],
      last: ['Ironhide', 'Skullcrusher', 'Bloodaxe', 'Stonefist', 'Warbringer', 'Grimtooth', 'Bonecrusher'],
    },
    female: {
      first: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha', 'Sutha', 'Vola', 'Volen', 'Yevelda', 'Grima', 'Draga'],
      last: ['Ironhide', 'Skullcrusher', 'Bloodaxe', 'Stonefist', 'Warbringer', 'Grimtooth', 'Bonecrusher'],
    },
    nonbinary: {
      first: ['Thok', 'Grok', 'Krag', 'Zug'],
      last: ['Ironhide', 'Stonefist', 'Grimtooth'],
    },
  },

  Tiefling: {
    male: {
      first: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai', 'Morthos', 'Pelaios', 'Skamos', 'Therai', 'Zethris', 'Infernus', 'Ashblight', 'Scornius'],
      last: ['Hellsfire', 'Shadowflame', 'Nightborn', 'Duskmantle', 'Emberheart', 'Voidseeker', 'Darkheart', 'Soulrend', 'Crimsonwing', 'Abysswalker', 'Infernalis', 'Dreadborn'],
    },
    female: {
      first: ['Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Phelaia', 'Rieta', 'Therris', 'Valeria', 'Seraphina', 'Lilith', 'Nyx', 'Belladonna'],
      last: ['Hellsfire', 'Shadowflame', 'Nightborn', 'Duskmantle', 'Emberheart', 'Voidseeker', 'Darkheart', 'Soulrend', 'Crimsonwing', 'Abysswalker', 'Infernalis', 'Dreadborn'],
    },
    nonbinary: {
      first: ['Ashbane', 'Ember', 'Nightshade', 'Voidcaller', 'Duskwing', 'Shadowstep', 'Inferno'],
      last: ['Hellsfire', 'Shadowflame', 'Voidseeker', 'Dreadborn', 'Abysswalker'],
    },
  },
};

// Fallback for races not in lists
const FALLBACK_NAMES = {
  male: {
    first: ['Aiden', 'Blake', 'Connor', 'Drake', 'Evan', 'Felix', 'Gideon', 'Hugo', 'Isaac', 'Jasper'],
    last: ['Smith', 'Cooper', 'Fletcher', 'Mason', 'Ward', 'Stone', 'Wood', 'Hill'],
  },
  female: {
    first: ['Ada', 'Beatrice', 'Clara', 'Daphne', 'Eden', 'Flora', 'Grace', 'Hazel', 'Ivy', 'Jade'],
    last: ['Smith', 'Cooper', 'Fletcher', 'Mason', 'Ward', 'Stone', 'Wood', 'Hill'],
  },
  nonbinary: {
    first: ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis', 'Finley', 'Gray', 'Harper'],
    last: ['Smith', 'Ward', 'Stone', 'Hill'],
  },
};

/**
 * Generate a random name using LLM (creative!) or fallback to list
 */
export async function generateRandomName(race: Race, gender: Gender): Promise<string> {
  try {
    // Try LLM generation first
    const response = await fetch('/api/names/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ race, gender }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.fullName || `${data.firstName} ${data.lastName}`;
    }
  } catch (error) {
    console.warn('[NameGenerator] LLM failed, using fallback:', error);
  }

  // Fallback to curated lists
  const raceNames = NAME_LISTS[race] || FALLBACK_NAMES;
  const genderNames = raceNames[gender] || raceNames.male;

  const firstName = randomChoice(genderNames.first);
  const lastName = randomChoice(genderNames.last);

  return `${firstName} ${lastName}`;
}

/**
 * Generate a random name synchronously (uses lists only)
 */
export function generateRandomNameSync(race: Race, gender: Gender): string {
  const raceNames = NAME_LISTS[race] || FALLBACK_NAMES;
  const genderNames = raceNames[gender] || raceNames.male;

  const firstName = randomChoice(genderNames.first);
  const lastName = randomChoice(genderNames.last);

  return `${firstName} ${lastName}`;
}

/**
 * Generate just a first name
 */
export function generateFirstName(race: Race, gender: Gender): string {
  const raceNames = NAME_LISTS[race] || FALLBACK_NAMES;
  const genderNames = raceNames[gender] || raceNames.male;

  return randomChoice(genderNames.first);
}

/**
 * Generate just a last name
 */
export function generateLastName(race: Race): string {
  const raceNames = NAME_LISTS[race] || FALLBACK_NAMES;
  const names = raceNames.male || FALLBACK_NAMES.male;

  return randomChoice(names.last);
}

/**
 * Get a random element from an array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get available races
 */
export function getAvailableRaces(): Race[] {
  return Object.keys(NAME_LISTS) as Race[];
}
