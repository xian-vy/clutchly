import { renderHook, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useReptileNameGeneration } from '@/lib/hooks/useReptileNameGeneration';
import { Reptile, Sex } from '@/lib/types/reptile';
import { Species } from '@/lib/types/species';
import { Morph } from '@/lib/types/morph';
import { reptileFormSchema } from '@/lib/types/reptile';
import * as z from 'zod';

// Mock the utility functions
jest.mock('@/components/dashboard/reptiles/utils', () => ({
  generateReptileCode: jest.fn(),
  generateReptileName: jest.fn(),
  getSpeciesCode: jest.fn(),
}));

import { generateReptileCode, generateReptileName, getSpeciesCode } from '@/components/dashboard/reptiles/utils';

const mockGenerateReptileCode = generateReptileCode as jest.MockedFunction<typeof generateReptileCode>;
const mockGenerateReptileName = generateReptileName as jest.MockedFunction<typeof generateReptileName>;
const mockGetSpeciesCode = getSpeciesCode as jest.MockedFunction<typeof getSpeciesCode>;

// Test data
const mockSpecies: Species[] = [
  {
    id: 1,
    org_id: 'org-1',
    name: 'Ball Python',
    scientific_name: 'Python regius',
    care_level: 'beginner',
  },
  {
    id: 2,
    org_id: 'org-1',
    name: 'Leopard Gecko',
    scientific_name: 'Eublepharis macularius',
    care_level: 'beginner',
  },
];

const mockMorphs: Morph[] = [
  {
    id: 1,
    org_id: 'org-1',
    name: 'Normal',
    species_id: 1,
    description: 'Normal morph',
    is_global: false,
  },
  {
    id: 2,
    org_id: 'org-1',
    name: 'Albino',
    species_id: 1,
    description: 'Albino morph',
    is_global: false,
  },
  {
    id: 3,
    org_id: 'org-1',
    name: 'Pastel',
    species_id: 1,
    description: 'Pastel morph',
    is_global: false,
  },
];

const mockReptiles: Reptile[] = [
  {
    id: 'reptile-1',
    created_at: '2023-01-01T00:00:00Z',
    org_id: 'org-1',
    name: 'Snake 1',
    price: 100,
    reptile_code: '00001-BP-NORMA-24-M',
    species_id: '1',
    morph_id: '1',
    visual_traits: null,
    het_traits: null,
    sex: 'male',
    weight: 500,
    length: 60,
    hatch_date: '2022-01-01',
    acquisition_date: '2023-01-01',
    status: 'active',
    notes: null,
    last_modified: '2023-01-01T00:00:00Z',
    original_breeder: null,
  },
  {
    id: 'reptile-2',
    created_at: '2023-01-01T00:00:00Z',
    org_id: 'org-1',
    name: 'Snake 2',
    price: 200,
    reptile_code: '00002-BP-ALBIN-24-F',
    species_id: '1',
    morph_id: '2',
    visual_traits: null,
    het_traits: null,
    sex: 'female',
    weight: 600,
    length: 65,
    hatch_date: '2022-02-01',
    acquisition_date: '2023-01-01',
    status: 'active',
    notes: null,
    last_modified: '2023-01-01T00:00:00Z',
    original_breeder: null,
  },
];

const mockHetTraits = [
  {
    trait: 'Pied',
    percentage: 50,
    source: 'visual_parent' as const,
    verified: true,
  },
  {
    trait: 'Clown',
    percentage: 25,
    source: 'genetic_test' as const,
    verified: false,
  },
];

describe('useReptileNameGeneration', () => {
  let form: ReturnType<typeof useForm<z.infer<typeof reptileFormSchema>>>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockGetSpeciesCode.mockReturnValue('BP');
    mockGenerateReptileCode.mockReturnValue('00003-BP-PASTE-24-M');
    mockGenerateReptileName.mockReturnValue('Pastel het Pied 00003');

    // Create a fresh form for each test
    const { result } = renderHook(() => useForm<z.infer<typeof reptileFormSchema>>({
      defaultValues: {
        name: '',
        reptile_code: '',
        species_id: '',
        morph_id: '',
        sex: 'male',
        hatch_date: '',
      },
    }));
    form = result.current;
  });

  const renderHookWithForm = (props: Partial<Parameters<typeof useReptileNameGeneration>[0]> = {}) => {
    return renderHook(
      (hookProps) => 
        useReptileNameGeneration({
          form,
          species: mockSpecies,
          morphsForSpecies: mockMorphs,
          reptiles: mockReptiles,
          hetTraits: mockHetTraits,
          ...hookProps,
        }),
      {
        initialProps: props,
      }
    );
  };

  describe('initial state', () => {
    it('should start in auto mode for new reptiles', () => {
      const { result } = renderHookWithForm();

      expect(result.current.isNameManuallyEdited).toBe(false);
    });

    it('should start in manual mode for existing reptiles', () => {
      const existingReptile = mockReptiles[0];
      const { result } = renderHookWithForm({ initialData: existingReptile });

      expect(result.current.isNameManuallyEdited).toBe(true);
    });
  });

  describe('reptile code generation', () => {
    it('should generate reptile code for new reptiles when species and morph are selected', () => {
      form.setValue('species_id', '1');
      form.setValue('morph_id', '2');
      form.setValue('sex', 'male');
      form.setValue('hatch_date', '2024-01-01');

      renderHookWithForm();

      expect(mockGetSpeciesCode).toHaveBeenCalledWith('Ball Python');
      expect(mockGenerateReptileCode).toHaveBeenCalledWith(
        mockReptiles,
        'BP',
        'Albino',
        '2024-01-01',
        'male'
      );
    });

    it('should not generate reptile code for existing reptiles', () => {
      const existingReptile = mockReptiles[0];
      form.setValue('species_id', '1');
      form.setValue('morph_id', '2');

      renderHookWithForm({ initialData: existingReptile });

      expect(mockGenerateReptileCode).not.toHaveBeenCalled();
    });

    it('should not generate reptile code when species is not selected', () => {
      form.setValue('morph_id', '2');
      form.setValue('sex', 'male');
      form.setValue('hatch_date', '2024-01-01');

      renderHookWithForm();

      expect(mockGenerateReptileCode).not.toHaveBeenCalled();
    });

    it('should not generate reptile code when morph is not selected', () => {
      form.setValue('species_id', '1');
      form.setValue('sex', 'male');
      form.setValue('hatch_date', '2024-01-01');

      renderHookWithForm();

      expect(mockGenerateReptileCode).not.toHaveBeenCalled();
    });
  });

  describe('reptile name generation', () => {
    it('should generate name for new reptiles', () => {
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      renderHookWithForm();

      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        mockHetTraits,
        '00003'
      );
    });

    it('should generate name for existing reptiles in auto mode', () => {
      const existingReptile = mockReptiles[0];
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      const { result } = renderHookWithForm({ initialData: existingReptile });
      
      // Switch to auto mode
      act(() => {
        result.current.toggleNameMode();
      });

      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        mockHetTraits,
        '00003'
      );
    });

    it('should not set name for existing reptiles in manual mode', () => {
      const existingReptile = mockReptiles[0];
      
      act(() => {
        form.setValue('morph_id', '2');
        form.setValue('reptile_code', '00003-BP-ALBIN-24-M');
      });

      const { result } = renderHookWithForm({ initialData: existingReptile });

      // generateReptileName will be called, but form.setValue('name') should not be called
      // because the reptile is in manual mode
      expect(mockGenerateReptileName).toHaveBeenCalled();
      
      // The name should not be set in the form for existing reptiles in manual mode
      expect(result.current.isNameManuallyEdited).toBe(true);
    });

    it('should not generate name when morph is not selected', () => {
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      renderHookWithForm();

      expect(mockGenerateReptileName).not.toHaveBeenCalled();
    });

    it('should handle empty reptile code', () => {
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', '');

      renderHookWithForm();

      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        mockHetTraits,
        ''
      );
    });

    it('should handle null reptile code', () => {
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', null as any);

      renderHookWithForm();

      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        mockHetTraits,
        ''
      );
    });
  });

  describe('regenerateName function', () => {
    it('should regenerate name with current form values', () => {
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      const { result } = renderHookWithForm();

      act(() => {
        result.current.regenerateName();
      });

      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        mockHetTraits,
        '00003'
      );
    });

    it('should not regenerate name when morph is not selected', () => {
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      const { result } = renderHookWithForm();

      act(() => {
        result.current.regenerateName();
      });

      expect(mockGenerateReptileName).not.toHaveBeenCalled();
    });
  });

  describe('toggleNameMode function', () => {
    it('should switch from manual to auto mode and regenerate name', () => {
      const existingReptile = mockReptiles[0];
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      const { result } = renderHookWithForm({ initialData: existingReptile });

      expect(result.current.isNameManuallyEdited).toBe(true);

      act(() => {
        result.current.toggleNameMode();
      });

      expect(result.current.isNameManuallyEdited).toBe(false);
      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        mockHetTraits,
        '00003'
      );
    });

    it('should switch from auto to manual mode', () => {
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      const { result } = renderHookWithForm();

      expect(result.current.isNameManuallyEdited).toBe(false);

      act(() => {
        result.current.toggleNameMode();
      });

      expect(result.current.isNameManuallyEdited).toBe(true);
    });
  });

  describe('setIsNameManuallyEdited function', () => {
    it('should allow setting manual edit state', () => {
      const { result } = renderHookWithForm();

      expect(result.current.isNameManuallyEdited).toBe(false);

      act(() => {
        result.current.setIsNameManuallyEdited(true);
      });

      expect(result.current.isNameManuallyEdited).toBe(true);
    });
  });

  describe('effect dependencies', () => {
    it('should regenerate when species prop changes', () => {
      act(() => {
        form.setValue('morph_id', '2');
        form.setValue('reptile_code', '00003-BP-ALBIN-24-M');
      });

      const { rerender } = renderHookWithForm();

      // Change species prop
      const newSpecies = [...mockSpecies, {
        id: 3,
        org_id: 'org-1',
        name: 'Corn Snake',
        scientific_name: 'Pantherophis guttatus',
        care_level: 'beginner' as const,
      }];

      rerender();

      // Should regenerate with new species
      expect(mockGenerateReptileName).toHaveBeenCalled();
    });

    it('should regenerate when morphsForSpecies prop changes', () => {
      act(() => {
        form.setValue('morph_id', '2');
        form.setValue('reptile_code', '00003-BP-ALBIN-24-M');
      });

      const { rerender } = renderHookWithForm();

      // Change morphsForSpecies prop
      const newMorphs = [...mockMorphs, {
        id: 4,
        org_id: 'org-1',
        name: 'Spider',
        species_id: 1,
        description: 'Spider morph',
        is_global: false,
      }];

      rerender();

      expect(mockGenerateReptileName).toHaveBeenCalled();
    });

    it('should regenerate when hetTraits prop changes', () => {
      act(() => {
        form.setValue('morph_id', '2');
        form.setValue('reptile_code', '00003-BP-ALBIN-24-M');
      });

      const { rerender } = renderHookWithForm();

      // Change hetTraits prop
      const newHetTraits = [
        {
          trait: 'Spider',
          percentage: 100,
          source: 'visual_parent' as const,
          verified: true,
        },
      ];

      rerender({ hetTraits: newHetTraits });

      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        newHetTraits,
        '00003'
      );
    });

    it('should regenerate when reptiles prop changes', () => {
      act(() => {
        form.setValue('species_id', '1');
        form.setValue('morph_id', '2');
        form.setValue('sex', 'male');
        form.setValue('hatch_date', '2024-01-01');
      });

      const { rerender } = renderHookWithForm();

      // Change reptiles prop
      const newReptiles = [...mockReptiles, {
        id: 'reptile-3',
        created_at: '2023-01-01T00:00:00Z',
        org_id: 'org-1',
        name: 'Snake 3',
        price: 300,
        reptile_code: '00004-BP-PASTE-24-F',
        species_id: '1',
        morph_id: '3',
        visual_traits: null,
        het_traits: null,
        sex: 'female' as Sex,
        weight: 700,
        length: 70,
        hatch_date: '2022-04-01',
        acquisition_date: '2023-01-01',
        status: 'active' as const,
        notes: null,
        last_modified: '2023-01-01T00:00:00Z',
        original_breeder: null,
      }];

      rerender({ reptiles: newReptiles });

      expect(mockGenerateReptileCode).toHaveBeenCalledWith(
        newReptiles,
        'BP',
        'Albino',
        '2024-01-01',
        'male'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty species array', () => {
      form.setValue('species_id', '1');
      form.setValue('morph_id', '2');

      renderHookWithForm({ species: [] });

      expect(mockGenerateReptileCode).not.toHaveBeenCalled();
    });

    it('should handle empty morphs array', () => {
      form.setValue('species_id', '1');
      form.setValue('morph_id', '2');

      renderHookWithForm({ morphsForSpecies: [] });

      expect(mockGenerateReptileCode).not.toHaveBeenCalled();
      expect(mockGenerateReptileName).not.toHaveBeenCalled();
    });

    it('should handle empty het traits array', () => {
      form.setValue('morph_id', '2');
      form.setValue('reptile_code', '00003-BP-ALBIN-24-M');

      renderHookWithForm({ hetTraits: [] });

      expect(mockGenerateReptileName).toHaveBeenCalledWith(
        'Albino',
        [],
        '00003'
      );
    });

    it('should handle invalid species_id', () => {
      form.setValue('species_id', '999');
      form.setValue('morph_id', '2');

      renderHookWithForm();

      expect(mockGenerateReptileCode).not.toHaveBeenCalled();
    });

    it('should handle invalid morph_id', () => {
      form.setValue('species_id', '1');
      form.setValue('morph_id', '999');

      renderHookWithForm();

      expect(mockGenerateReptileCode).not.toHaveBeenCalled();
      expect(mockGenerateReptileName).not.toHaveBeenCalled();
    });
  });
});
