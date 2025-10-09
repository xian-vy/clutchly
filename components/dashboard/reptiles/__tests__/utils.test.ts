import { generateReptileCode, generateReptileName, getSpeciesCode } from '../utils';
import { Reptile, Sex } from '@/lib/types/reptile';

describe('Reptile Utils', () => {
  describe('generateReptileCode', () => {
    const mockReptiles: Reptile[] = [
      {
        id: '1',
        created_at: '2024-01-01',
        org_id: 'org1',
        name: 'Test Reptile 1',
        price: null,
        reptile_code: '00001-BP-ALBIN-24-M',
        species_id: 'species1',
        morph_id: 'morph1',
        visual_traits: null,
        het_traits: null,
        sex: 'male' as Sex,
        weight: 100,
        length: 50,
        hatch_date: '2024-01-01',
        acquisition_date: '2024-01-01',
        status: 'active',
        notes: null,
        last_modified: '2024-01-01',
        original_breeder: null
      },
      {
        id: '2',
        created_at: '2024-01-01',
        org_id: 'org1',
        name: 'Test Reptile 2',
        price: null,
        reptile_code: '00003-BP-PASTE-24-F',
        species_id: 'species1',
        morph_id: 'morph2',
        visual_traits: null,
        het_traits: null,
        sex: 'female' as Sex,
        weight: 120,
        length: 55,
        hatch_date: '2024-01-01',
        acquisition_date: '2024-01-01',
        status: 'active',
        notes: null,
        last_modified: '2024-01-01',
        original_breeder: null
      }
    ];

    it('should generate reptile code with correct format for male', () => {
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'Spider',
        '2024-01-01',
        'male'
      );
      
      expect(result).toBe('00004-BP-SPIDE-24-M');
    });

    it('should generate reptile code with correct format for female', () => {
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'Pastel',
        '2024-01-01',
        'female'
      );
      
      expect(result).toBe('00004-BP-PASTE-24-F');
    });

    it('should generate reptile code with correct format for unknown sex', () => {
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'Albino',
        '2024-01-01',
        'unknown'
      );
      
      expect(result).toBe('00004-BP-ALBIN-24-U');
    });

    it('should use current year when hatch date is null', () => {
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'Normal',
        null,
        'male'
      );
      
      expect(result).toBe(`00004-BP-NORMA-${currentYear}-M`);
    });

    it('should handle morph names with spaces', () => {
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'Super Pastel',
        '2024-01-01',
        'male'
      );
      
      expect(result).toBe('00004-BP-SUPER-24-M');
    });

    it('should truncate long morph names to 5 characters', () => {
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'VeryLongMorphName',
        '2024-01-01',
        'male'
      );
      
      expect(result).toBe('00004-BP-VERYL-24-M');
    });

    it('should handle empty reptiles array', () => {
      const result = generateReptileCode(
        [],
        'BP',
        'Normal',
        '2024-01-01',
        'male'
      );
      
      expect(result).toBe('00001-BP-NORMA-24-M');
    });

    it('should handle reptiles without reptile_code', () => {
      const reptilesWithoutCode = [
        {
          ...mockReptiles[0],
          reptile_code: null
        }
      ];
      
      const result = generateReptileCode(
        reptilesWithoutCode,
        'BP',
        'Normal',
        '2024-01-01',
        'male'
      );
      
      expect(result).toBe('00001-BP-NORMA-24-M');
    });

    it('should handle reptiles with malformed reptile_code', () => {
      const reptilesWithMalformedCode = [
        {
          ...mockReptiles[0],
          reptile_code: 'invalid-code'
        }
      ];
      
      const result = generateReptileCode(
        reptilesWithMalformedCode,
        'BP',
        'Normal',
        '2024-01-01',
        'male'
      );
      
      expect(result).toBe('00001-BP-NORMA-24-M');
    });

    it('should increment sequence number correctly', () => {
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'Normal',
        '2024-01-01',
        'male'
      );
      
      // Should be 00004 since we have 00001 and 00003 in mock data
      expect(result).toBe('00004-BP-NORMA-24-M');
    });

    it('should handle different species codes', () => {
      const result = generateReptileCode(
        mockReptiles,
        'CORN',
        'Normal',
        '2024-01-01',
        'male'
      );
      
      expect(result).toBe('00004-CORN-NORMA-24-M');
    });

    it('should handle different years', () => {
      const result = generateReptileCode(
        mockReptiles,
        'BP',
        'Normal',
        '2023-01-01',
        'male'
      );
      
      expect(result).toBe('00004-BP-NORMA-23-M');
    });
  });

  describe('generateReptileName', () => {
    it('should generate name with morph only', () => {
      const result = generateReptileName('pastel');
      
      expect(result).toBe('Pastel');
    });

    it('should capitalize morph name correctly', () => {
      const result = generateReptileName('super pastel');
      
      expect(result).toBe('Super Pastel');
    });

    it('should handle single word morph', () => {
      const result = generateReptileName('ALBINO');
      
      expect(result).toBe('Albino');
    });

    it('should generate name with morph and het traits', () => {
      const hetTraits = [
        { trait: 'albino', percentage: 50 },
        { trait: 'pied', percentage: 25 }
      ];
      
      const result = generateReptileName('pastel', hetTraits);
      
      expect(result).toBe('Pastel het Albino het Pied');
    });

    it('should filter out het traits with 0 percentage', () => {
      const hetTraits = [
        { trait: 'albino', percentage: 50 },
        { trait: 'pied', percentage: 0 },
        { trait: 'spider', percentage: 25 }
      ];
      
      const result = generateReptileName('pastel', hetTraits);
      
      expect(result).toBe('Pastel het Albino het Spider');
    });

    it('should capitalize het trait names correctly', () => {
      const hetTraits = [
        { trait: 'super pastel', percentage: 50 }
      ];
      
      const result = generateReptileName('normal', hetTraits);
      
      expect(result).toBe('Normal het Super Pastel');
    });

    it('should include sequence number when provided', () => {
      const result = generateReptileName('pastel', [], '00035');
      
      expect(result).toBe('Pastel 00035');
    });

    it('should generate complete name with all components', () => {
      const hetTraits = [
        { trait: 'albino', percentage: 50 },
        { trait: 'pied', percentage: 25 }
      ];
      
      const result = generateReptileName('super pastel', hetTraits, '00035');
      
      expect(result).toBe('Super Pastel het Albino het Pied 00035');
    });

    it('should handle empty het traits array', () => {
      const result = generateReptileName('normal', []);
      
      expect(result).toBe('Normal');
    });

    it('should handle undefined het traits', () => {
      const result = generateReptileName('normal');
      
      expect(result).toBe('Normal');
    });

    it('should handle empty morph name', () => {
      const result = generateReptileName('');
      
      expect(result).toBe('');
    });

    it('should handle morph name with multiple spaces', () => {
      const result = generateReptileName('super   pastel   ball');
      
      expect(result).toBe('Super   Pastel   Ball');
    });
  });

  describe('getSpeciesCode', () => {
    it('should generate species code from single word', () => {
      const result = getSpeciesCode('Python');
      
      expect(result).toBe('P');
    });

    it('should generate species code from two words', () => {
      const result = getSpeciesCode('Ball Python');
      
      expect(result).toBe('BP');
    });

    it('should generate species code from multiple words', () => {
      const result = getSpeciesCode('Corn Snake');
      
      expect(result).toBe('CS');
    });

    it('should handle three word species names', () => {
      const result = getSpeciesCode('Red Tail Boa');
      
      expect(result).toBe('RTB');
    });

    it('should convert to uppercase', () => {
      const result = getSpeciesCode('ball python');
      
      expect(result).toBe('BP');
    });

    it('should handle mixed case', () => {
      const result = getSpeciesCode('BaLL pYtHoN');
      
      expect(result).toBe('BP');
    });

    it('should handle empty string', () => {
      const result = getSpeciesCode('');
      
      expect(result).toBe('');
    });

    it('should handle single character words', () => {
      const result = getSpeciesCode('A B C');
      
      expect(result).toBe('ABC');
    });

    it('should handle words with numbers', () => {
      const result = getSpeciesCode('Python 2.0');
      
      expect(result).toBe('P2');
    });

    it('should handle special characters', () => {
      const result = getSpeciesCode('Python-regius');
      
      expect(result).toBe('P');
    });
  });
});
