import { renderHook } from '@testing-library/react';
import useInitializeCommonData from '@/lib/hooks/useInitializeCommonData';
import { useFeedersStore } from '@/lib/stores/feedersStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Organization } from '@/lib/types/organizations';
import { Species } from '@/lib/types/species';
import { FeederType, FeederSize } from '@/lib/types/feeders';
import { Morph } from '@/lib/types/morph';

// Mock the store dependencies
jest.mock('@/lib/stores/feedersStore', () => ({
  useFeedersStore: jest.fn(),
}));

jest.mock('@/lib/stores/speciesStore', () => ({
  useSpeciesStore: jest.fn(),
}));

jest.mock('@/lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/stores/morphsStore', () => ({
  useMorphsStore: jest.fn(),
}));

const mockUseFeedersStore = useFeedersStore as jest.MockedFunction<typeof useFeedersStore>;
const mockUseSpeciesStore = useSpeciesStore as jest.MockedFunction<typeof useSpeciesStore>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseMorphsStore = useMorphsStore as jest.MockedFunction<typeof useMorphsStore>;

// Type definitions for mock store return values
type MockFeedersStoreReturn = {
  feederSizes: FeederSize[];
  feederTypes: FeederType[];
  fetchFeederSizes: jest.MockedFunction<(organization: Organization) => Promise<void>>;
  fetchFeederTypes: jest.MockedFunction<(organization: Organization) => Promise<void>>;
};

type MockSpeciesStoreReturn = {
  species: Species[];
  fetchSpecies: jest.MockedFunction<(organization: Organization) => Promise<void>>;
  fetchInitialSpecies: jest.MockedFunction<() => Promise<void>>;
};

type MockAuthStoreReturn = {
  organization: Organization | undefined;
  isLoading: boolean;
};

type MockMorphsStoreReturn = {
  morphs: (Morph & { species: { name: string } })[];
  downloadCommonMorphs: jest.MockedFunction<(organization: Organization, selectedSpeciesIds?: string[]) => Promise<void>>;
};

// Test data
const mockOrganization: Organization = {
  id: 'org-1',
  email: 'test@example.com',
  full_name: 'Test Organization',
  account_type: 'keeper',
  collection_size: 10,
  created_at: '2023-01-01T00:00:00Z',
  is_active: true,
  selected_species: ['1', '2'],
  logo: null,
};

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

const mockFeederTypes: FeederType[] = [
  {
    id: '1',
    org_id: 'org-1',
    name: 'Mice',
    description: 'Small rodents',
    is_global: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    org_id: 'org-1',
    name: 'Crickets',
    description: 'Insects',
    is_global: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockFeederSizes: FeederSize[] = [
  {
    id: '1',
    org_id: 'org-1',
    feeder_type_id: '1',
    name: 'Pinkie',
    description: '1-3g',
    is_global: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    org_id: 'org-1',
    feeder_type_id: '1',
    name: 'Fuzzy',
    description: '3-5g',
    is_global: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockMorphs: (Morph & { species: { name: string } })[] = [
  {
    id: 1,
    org_id: 'org-1',
    name: 'Normal',
    species_id: 1,
    description: 'Normal morph',
    is_global: false,
    species: { name: 'Ball Python' },
  },
  {
    id: 2,
    org_id: 'org-1',
    name: 'Albino',
    species_id: 1,
    description: 'Albino morph',
    is_global: false,
    species: { name: 'Ball Python' },
  },
];

describe('useInitializeCommonData', () => {
  const mockFetchSpecies = jest.fn();
  const mockFetchInitialSpecies = jest.fn();
  const mockFetchFeederSizes = jest.fn();
  const mockFetchFeederTypes = jest.fn();
  const mockDownloadCommonMorphs = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseFeedersStore.mockReturnValue({
      feederSizes: [],
      feederTypes: [],
      fetchFeederSizes: mockFetchFeederSizes,
      fetchFeederTypes: mockFetchFeederTypes,
    } as MockFeedersStoreReturn);

    mockUseSpeciesStore.mockReturnValue({
      species: [],
      fetchSpecies: mockFetchSpecies,
      fetchInitialSpecies: mockFetchInitialSpecies,
    } as MockSpeciesStoreReturn);

    mockUseAuthStore.mockReturnValue({
      organization: mockOrganization,
      isLoading: false,
    } as MockAuthStoreReturn);

    mockUseMorphsStore.mockReturnValue({
      morphs: [],
      downloadCommonMorphs: mockDownloadCommonMorphs,
    } as MockMorphsStoreReturn);
  });

  describe('species initialization', () => {
    it('should fetch initial species when organization has no selected species', () => {
      const organizationWithNoSpecies = {
        ...mockOrganization,
        selected_species: [],
      };

      mockUseAuthStore.mockReturnValue({
        organization: organizationWithNoSpecies,
        isLoading: false,
      } as MockAuthStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchInitialSpecies).toHaveBeenCalledTimes(1);
      expect(mockFetchSpecies).not.toHaveBeenCalled();
    });

    it('should fetch species for organization when selected species exist', () => {
      renderHook(() => useInitializeCommonData());

      expect(mockFetchSpecies).toHaveBeenCalledWith(mockOrganization);
      expect(mockFetchInitialSpecies).not.toHaveBeenCalled();
    });

    it('should not fetch species when species already exist', () => {
      mockUseSpeciesStore.mockReturnValue({
        species: mockSpecies,
        fetchSpecies: mockFetchSpecies,
        fetchInitialSpecies: mockFetchInitialSpecies,
      } as MockSpeciesStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchSpecies).not.toHaveBeenCalled();
      expect(mockFetchInitialSpecies).not.toHaveBeenCalled();
    });

    it('should not fetch species when organization is loading', () => {
      mockUseAuthStore.mockReturnValue({
        organization: mockOrganization,
        isLoading: true,
      } as MockAuthStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchSpecies).not.toHaveBeenCalled();
      expect(mockFetchInitialSpecies).not.toHaveBeenCalled();
    });

    it('should not fetch species when organization is not available', () => {
      mockUseAuthStore.mockReturnValue({
        organization: undefined,
        isLoading: false,
      } as MockAuthStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchSpecies).not.toHaveBeenCalled();
      expect(mockFetchInitialSpecies).not.toHaveBeenCalled();
    });
  });

  describe('feeder sizes initialization', () => {
    it('should fetch feeder sizes when none exist and organization is available', () => {
      renderHook(() => useInitializeCommonData());

      expect(mockFetchFeederSizes).toHaveBeenCalledWith(mockOrganization);
    });

    it('should not fetch feeder sizes when they already exist', () => {
      mockUseFeedersStore.mockReturnValue({
        feederSizes: mockFeederSizes,
        feederTypes: [],
        fetchFeederSizes: mockFetchFeederSizes,
        fetchFeederTypes: mockFetchFeederTypes,
      } as MockFeedersStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchFeederSizes).not.toHaveBeenCalled();
    });

    it('should not fetch feeder sizes when organization is not available', () => {
      mockUseAuthStore.mockReturnValue({
        organization: undefined,
        isLoading: false,
      } as MockAuthStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchFeederSizes).not.toHaveBeenCalled();
    });
  });

  describe('feeder types initialization', () => {
    it('should fetch feeder types when none exist and organization is available', () => {
      renderHook(() => useInitializeCommonData());

      expect(mockFetchFeederTypes).toHaveBeenCalledWith(mockOrganization);
    });

    it('should not fetch feeder types when they already exist', () => {
      mockUseFeedersStore.mockReturnValue({
        feederSizes: [],
        feederTypes: mockFeederTypes,
        fetchFeederSizes: mockFetchFeederSizes,
        fetchFeederTypes: mockFetchFeederTypes,
      } as MockFeedersStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchFeederTypes).not.toHaveBeenCalled();
    });

    it('should not fetch feeder types when organization is not available', () => {
      mockUseAuthStore.mockReturnValue({
        organization: undefined,
        isLoading: false,
      } as MockAuthStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchFeederTypes).not.toHaveBeenCalled();
    });
  });

  describe('morphs initialization', () => {
    it('should download common morphs when none exist and organization is available', async () => {
      mockDownloadCommonMorphs.mockResolvedValue(undefined);

      renderHook(() => useInitializeCommonData());

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockDownloadCommonMorphs).toHaveBeenCalledWith(
        mockOrganization,
        mockOrganization.selected_species
      );
    });

    it('should not download morphs when they already exist', () => {
      mockUseMorphsStore.mockReturnValue({
        morphs: mockMorphs,
        downloadCommonMorphs: mockDownloadCommonMorphs,
      } as MockMorphsStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockDownloadCommonMorphs).not.toHaveBeenCalled();
    });

    it('should not download morphs when organization is not available', () => {
      mockUseAuthStore.mockReturnValue({
        organization: undefined,
        isLoading: false,
      } as MockAuthStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockDownloadCommonMorphs).not.toHaveBeenCalled();
    });

    it('should handle missing selected species in organization', () => {
      const organizationWithoutSpecies = {
        ...mockOrganization,
        selected_species: null,
      };

      mockUseAuthStore.mockReturnValue({
        organization: organizationWithoutSpecies,
        isLoading: false,
      } as MockAuthStoreReturn);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useInitializeCommonData());

      expect(consoleSpy).toHaveBeenCalledWith(
        'Download Morph Failed. No species IDs found in organization'
      );
      expect(mockDownloadCommonMorphs).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log when downloading common morphs', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useInitializeCommonData());

      expect(consoleSpy).toHaveBeenCalledWith('Downloading common morphs...');

      consoleSpy.mockRestore();
    });
  });

  describe('multiple effects interaction', () => {
    it('should run all initialization effects when all data is missing', () => {
      renderHook(() => useInitializeCommonData());

      expect(mockFetchSpecies).toHaveBeenCalledWith(mockOrganization);
      expect(mockFetchFeederSizes).toHaveBeenCalledWith(mockOrganization);
      expect(mockFetchFeederTypes).toHaveBeenCalledWith(mockOrganization);
    });

    it('should only run missing data initialization effects', () => {
      mockUseSpeciesStore.mockReturnValue({
        species: mockSpecies,
        fetchSpecies: mockFetchSpecies,
        fetchInitialSpecies: mockFetchInitialSpecies,
      } as MockSpeciesStoreReturn);

      mockUseFeedersStore.mockReturnValue({
        feederSizes: mockFeederSizes,
        feederTypes: [],
        fetchFeederSizes: mockFetchFeederSizes,
        fetchFeederTypes: mockFetchFeederTypes,
      } as MockFeedersStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchSpecies).not.toHaveBeenCalled();
      expect(mockFetchFeederSizes).not.toHaveBeenCalled();
      expect(mockFetchFeederTypes).toHaveBeenCalledWith(mockOrganization);
    });

    it('should handle organization becoming available after initial render', () => {
      // Start with no organization
      mockUseAuthStore.mockReturnValue({
        organization: undefined,
        isLoading: false,
      } as MockAuthStoreReturn);

      const { rerender } = renderHook(() => useInitializeCommonData());

      // Initially no organization
      expect(mockFetchSpecies).not.toHaveBeenCalled();

      // Organization becomes available
      mockUseAuthStore.mockReturnValue({
        organization: mockOrganization,
        isLoading: false,
      } as MockAuthStoreReturn);

      rerender();

      expect(mockFetchSpecies).toHaveBeenCalledWith(mockOrganization);
    });
  });

  describe('edge cases', () => {
    it('should handle empty selected species array', () => {
      const organizationWithEmptySpecies = {
        ...mockOrganization,
        selected_species: [],
      };

      mockUseAuthStore.mockReturnValue({
        organization: organizationWithEmptySpecies,
        isLoading: false,
      } as MockAuthStoreReturn);

      renderHook(() => useInitializeCommonData());

      expect(mockFetchInitialSpecies).toHaveBeenCalledTimes(1);
    });

    it('should handle organization with null selected species', () => {
      const organizationWithNullSpecies = {
        ...mockOrganization,
        selected_species: null,
      };

      mockUseAuthStore.mockReturnValue({
        organization: organizationWithNullSpecies,
        isLoading: false,
      } as MockAuthStoreReturn);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useInitializeCommonData());

      expect(consoleSpy).toHaveBeenCalledWith(
        'Download Morph Failed. No species IDs found in organization'
      );

      consoleSpy.mockRestore();
    });
  });
});
