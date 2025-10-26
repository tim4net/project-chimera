/**
 * @file EquipmentSelector.test.tsx
 * @description Tests for equipment selection component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EquipmentSelector from '../components/EquipmentSelector';

describe('EquipmentSelector', () => {
  const mockOnSelectPackage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Equipment Dropdown', () => {
    it('renders equipment packages for Fighter', () => {
      render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText('Chain Mail & Shield')).toBeInTheDocument();
      expect(screen.getByText('Leather & Greatsword')).toBeInTheDocument();
    });

    it('renders equipment packages for Wizard', () => {
      render(
        <EquipmentSelector
          characterClass="Wizard"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText('Dagger & Spellbook')).toBeInTheDocument();
      expect(screen.getByText('Quarterstaff & Spellbook')).toBeInTheDocument();
    });

    it('renders equipment packages for Rogue', () => {
      render(
        <EquipmentSelector
          characterClass="Rogue"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText('Rapier & Shortbow')).toBeInTheDocument();
      expect(screen.getByText('Shortsword & Daggers')).toBeInTheDocument();
    });

    it('highlights selected package', () => {
      render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      const selectedPackage = screen.getByText('Chain Mail & Shield').closest('div');
      expect(selectedPackage).toHaveClass('border-nuaibria-gold');
    });

    it('calls onSelectPackage when package is clicked', () => {
      render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      const secondPackage = screen.getByText('Leather & Greatsword').closest('div');
      fireEvent.click(secondPackage!);

      expect(mockOnSelectPackage).toHaveBeenCalledWith(1);
    });
  });

  describe('Item List Display', () => {
    it('displays all items in Fighter Chain Mail package', () => {
      render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getAllByText('Chain Mail').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Longsword').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Shield').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Light Crossbow').length).toBeGreaterThan(0);
      expect(screen.getAllByText("Dungeoneer's Pack").length).toBeGreaterThan(0);
    });

    it('displays all items in Wizard package', () => {
      render(
        <EquipmentSelector
          characterClass="Wizard"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getAllByText('Robes').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dagger').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Arcane Focus').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Spellbook').length).toBeGreaterThan(0);
      expect(screen.getAllByText("Scholar's Pack").length).toBeGreaterThan(0);
    });
  });

  describe('Gold Calculation', () => {
    it('displays correct gold value for Fighter Chain Mail package', () => {
      render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText('Value: 150 gp')).toBeInTheDocument();
    });

    it('displays correct gold value for Wizard package', () => {
      render(
        <EquipmentSelector
          characterClass="Wizard"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText('Value: 40 gp')).toBeInTheDocument();
    });

    it('displays correct gold value for Barbarian package', () => {
      render(
        <EquipmentSelector
          characterClass="Barbarian"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText('Value: 50 gp')).toBeInTheDocument();
    });

    it('displays correct gold value for Paladin package', () => {
      render(
        <EquipmentSelector
          characterClass="Paladin"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText('Value: 160 gp')).toBeInTheDocument();
    });
  });

  describe('Selected Package Summary', () => {
    it('displays selected package name in summary', () => {
      render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText(/Selected: Chain Mail & Shield/)).toBeInTheDocument();
    });

    it('updates summary when different package is selected', () => {
      const { rerender } = render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText(/Selected: Chain Mail & Shield/)).toBeInTheDocument();

      rerender(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={1}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getByText(/Selected: Leather & Greatsword/)).toBeInTheDocument();
    });

    it('displays gold value in summary', () => {
      render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      const goldElements = screen.getAllByText(/150 gp/);
      expect(goldElements.length).toBeGreaterThan(0);
    });
  });

  describe('Class-Specific Equipment', () => {
    it('shows different equipment for different classes', () => {
      const { rerender } = render(
        <EquipmentSelector
          characterClass="Fighter"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.getAllByText('Chain Mail').length).toBeGreaterThan(0);

      rerender(
        <EquipmentSelector
          characterClass="Wizard"
          selectedPackageIndex={0}
          onSelectPackage={mockOnSelectPackage}
        />
      );

      expect(screen.queryByText('Chain Mail')).not.toBeInTheDocument();
      expect(screen.getAllByText('Robes').length).toBeGreaterThan(0);
    });
  });
});
