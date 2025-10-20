// Test file demonstrating equipment data usage
import { weapons, armor, gear, equipment } from './equipment';

describe('Equipment Data', () => {
  describe('Weapons', () => {
    it('should have all weapon data', () => {
      expect(weapons.longsword).toBeDefined();
      expect(weapons.longsword.name).toBe('Longsword');
      expect(weapons.longsword.damage).toBe('1d8');
      expect(weapons.longsword.damageType).toBe('slashing');
      expect(weapons.longsword.versatileDamage).toBe('1d10');
    });

    it('should have ranged weapon data with range', () => {
      expect(weapons.shortbow).toBeDefined();
      expect(weapons.shortbow.range).toBeDefined();
      expect(weapons.shortbow.range?.normal).toBe(80);
      expect(weapons.shortbow.range?.long).toBe(320);
    });

    it('should categorize weapons correctly', () => {
      expect(weapons.dagger.weaponCategory).toBe('Simple');
      expect(weapons.longsword.weaponCategory).toBe('Martial');
    });
  });

  describe('Armor', () => {
    it('should have all armor data', () => {
      expect(armor.chain_mail).toBeDefined();
      expect(armor.chain_mail.name).toBe('Chain Mail');
      expect(armor.chain_mail.armorClass).toBe(16);
      expect(armor.chain_mail.armorType).toBe('Heavy');
    });

    it('should have stealth disadvantage flag', () => {
      expect(armor.chain_mail.stealthDisadvantage).toBe(true);
      expect(armor.leather_armor.stealthDisadvantage).toBeUndefined();
    });

    it('should have strength requirements for heavy armor', () => {
      expect(armor.chain_mail.strMinimum).toBe(13);
      expect(armor.plate_armor.strMinimum).toBe(15);
    });
  });

  describe('Adventuring Gear', () => {
    it('should have basic gear', () => {
      expect(gear.backpack).toBeDefined();
      expect(gear.backpack.name).toBe('Backpack');
      expect(gear.backpack.cost).toBe(2);
      expect(gear.backpack.weight).toBe(5);
    });

    it('should have gear with descriptions', () => {
      expect(gear.acid__vial_).toBeDefined();
      expect(gear.acid__vial_.description).toContain('2d6 acid damage');
    });
  });

  describe('Equipment Index', () => {
    it('should export all equipment categories', () => {
      expect(equipment.weapons).toBeDefined();
      expect(equipment.armor).toBeDefined();
      expect(equipment.gear).toBeDefined();
    });

    it('should be accessible through index', () => {
      expect(equipment.weapons.longsword.damage).toBe('1d8');
      expect(equipment.armor.chain_mail.armorClass).toBe(16);
      expect(equipment.gear.backpack.cost).toBe(2);
    });
  });
});
