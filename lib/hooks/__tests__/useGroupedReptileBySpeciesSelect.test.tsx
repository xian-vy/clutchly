import { renderHook, render, screen, fireEvent } from '@testing-library/react';
import { ReactNode, ComponentProps } from 'react';
import { useGroupedReptileBySpeciesSelect } from '@/lib/hooks/useGroupedReptileBySpeciesSelect';
import { Reptile } from '@/lib/types/reptile';
import { Species } from '@/lib/types/species';

// Mock the dependencies
jest.mock('@/lib/stores/speciesStore', () => ({
  useSpeciesStore: jest.fn(),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: ComponentProps<'button'>) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/command', () => ({
  Command: ({ children }: { children: ReactNode }) => <div data-testid="command">{children}</div>,
  CommandEmpty: ({ children }: { children: ReactNode }) => <div data-testid="command-empty">{children}</div>,
  CommandInput: ({ placeholder, ...props }: { placeholder?: string } & ComponentProps<'input'>) => (
    <input data-testid="command-input" placeholder={placeholder} {...props} />
  ),
  CommandItem: ({ children, onSelect, value, ...props }: { children: ReactNode; onSelect?: () => void; value?: string } & ComponentProps<'div'>) => (
    <div data-testid="command-item" onClick={onSelect} data-value={value} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="popover" data-open={open} onClick={() => onOpenChange?.(!open)}>
      {children}
    </div>
  ),
  PopoverContent: ({ children }: { children: ReactNode }) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children, asChild, disabled }: { children: ReactNode; asChild?: boolean; disabled?: boolean }) => (
    <div data-testid="popover-trigger" data-disabled={disabled}>
      {asChild ? children : <div>{children}</div>}
    </div>
  ),
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  ChevronsUpDown: () => <div data-testid="chevron-icon" />,
}));

import { useSpeciesStore } from '@/lib/stores/speciesStore';

const mockUseSpeciesStore = useSpeciesStore as jest.MockedFunction<typeof useSpeciesStore>;

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
  {
    id: 3,
    org_id: 'org-1',
    name: 'Bearded Dragon',
    scientific_name: 'Pogona vitticeps',
    care_level: 'intermediate',
  },
];

const mockReptiles: Reptile[] = [
  {
    id: 'reptile-1',
    created_at: '2023-01-01T00:00:00Z',
    org_id: 'org-1',
    name: 'Snake 1',
    price: 100,
    reptile_code: 'BP001',
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
    reptile_code: 'BP002',
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
  {
    id: 'reptile-3',
    created_at: '2023-01-01T00:00:00Z',
    org_id: 'org-1',
    name: 'Gecko 1',
    price: 50,
    reptile_code: 'LG001',
    species_id: '2',
    morph_id: '3',
    visual_traits: null,
    het_traits: null,
    sex: 'male',
    weight: 30,
    length: 15,
    hatch_date: '2022-03-01',
    acquisition_date: '2023-01-01',
    status: 'active',
    notes: null,
    last_modified: '2023-01-01T00:00:00Z',
    original_breeder: null,
  },
];

describe('useGroupedReptileBySpeciesSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseSpeciesStore.mockReturnValue({
      species: mockSpecies,
    });
  });

  describe('groupedReptiles', () => {
    it('should group reptiles by species correctly', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { groupedReptiles } = result.current;

      expect(groupedReptiles).toHaveLength(2); // 2 species with reptiles

      // Check Ball Python group
      const ballPythonGroup = groupedReptiles.find(group => group.label === 'Ball Python');
      expect(ballPythonGroup).toBeDefined();
      expect(ballPythonGroup?.items).toHaveLength(2);
      expect(ballPythonGroup?.items[0]).toEqual({
        value: 'reptile-1',
        label: 'Snake 1',
        code: 'BP001',
        searchValue: 'Snake 1 BP001',
      });
      expect(ballPythonGroup?.items[1]).toEqual({
        value: 'reptile-2',
        label: 'Snake 2',
        code: 'BP002',
        searchValue: 'Snake 2 BP002',
      });

      // Check Leopard Gecko group
      const leopardGeckoGroup = groupedReptiles.find(group => group.label === 'Leopard Gecko');
      expect(leopardGeckoGroup).toBeDefined();
      expect(leopardGeckoGroup?.items).toHaveLength(1);
      expect(leopardGeckoGroup?.items[0]).toEqual({
        value: 'reptile-3',
        label: 'Gecko 1',
        code: 'LG001',
        searchValue: 'Gecko 1 LG001',
      });
    });

    it('should filter out species with no reptiles', () => {
      const speciesWithEmpty: Species[] = [
        ...mockSpecies,
        {
          id: 4,
          org_id: 'org-1',
          name: 'Empty Species',
          scientific_name: 'Emptyus species',
          care_level: 'beginner',
        },
      ];

      mockUseSpeciesStore.mockReturnValue({
        species: speciesWithEmpty,
      });

      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { groupedReptiles } = result.current;
      expect(groupedReptiles).toHaveLength(2); // Should not include Empty Species
      expect(groupedReptiles.find(group => group.label === 'Empty Species')).toBeUndefined();
    });

    it('should handle empty reptiles array', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: []
        })
      );

      const { groupedReptiles } = result.current;
      expect(groupedReptiles).toHaveLength(0);
    });

    it('should handle empty species array', () => {
      mockUseSpeciesStore.mockReturnValue({
        species: [],
      });

      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { groupedReptiles } = result.current;
      expect(groupedReptiles).toHaveLength(0);
    });

    it('should handle reptiles with null reptile_code', () => {
      const reptilesWithNullCode: Reptile[] = [
        {
          ...mockReptiles[0],
          reptile_code: null,
        },
      ];

      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: reptilesWithNullCode
        })
      );

      const { groupedReptiles } = result.current;
      const ballPythonGroup = groupedReptiles.find(group => group.label === 'Ball Python');
      expect(ballPythonGroup?.items[0].code).toBeNull();
      expect(ballPythonGroup?.items[0].searchValue).toBe('Snake 1 null');
    });
  });

  describe('ReptileSelect component', () => {
    const TestWrapper = ({ children }: { children: ReactNode }) => <div>{children}</div>;

    it('should render with default placeholder', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText('Select a reptile...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect 
            value="" 
            onValueChange={jest.fn()} 
            placeholder="Choose a reptile..." 
          />
        </TestWrapper>
      );

      expect(screen.getByText('Choose a reptile...')).toBeInTheDocument();
    });

    it('should display selected reptile name', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect 
            value="reptile-1" 
            onValueChange={jest.fn()} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('Snake 1')).toBeInTheDocument();
    });

    it('should open popover when clicked', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'false');

      fireEvent.click(popover);
      expect(popover).toHaveAttribute('data-open', 'true');
    });

    it('should render command input with correct placeholder', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      const commandInput = screen.getByTestId('command-input');
      expect(commandInput).toHaveAttribute('placeholder', 'Search by name or code...');
    });

    it('should render species groups as command items', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      expect(screen.getByText('Ball Python')).toBeInTheDocument();
      expect(screen.getByText('Leopard Gecko')).toBeInTheDocument();
    });

    it('should expand/collapse species groups when clicked', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      // Initially, reptile items should not be visible
      expect(screen.queryByText('Snake 1')).not.toBeInTheDocument();

      // Click on Ball Python species group to expand
      const ballPythonGroup = screen.getByText('Ball Python');
      fireEvent.click(ballPythonGroup);

      // Now reptile items should be visible
      expect(screen.getByText('Snake 1')).toBeInTheDocument();
      expect(screen.getByText('BP001')).toBeInTheDocument();
    });

    it('should call onValueChange when reptile is selected', () => {
      const mockOnValueChange = jest.fn();
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect value="" onValueChange={mockOnValueChange} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      // Expand Ball Python species group
      const ballPythonGroup = screen.getByText('Ball Python');
      fireEvent.click(ballPythonGroup);

      // Click on Snake 1
      const snake1Item = screen.getByText('Snake 1');
      fireEvent.click(snake1Item);

      expect(mockOnValueChange).toHaveBeenCalledWith('reptile-1');
    });

    it('should show check icon for selected reptile', () => {
      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: mockReptiles
        })
      );

      const { ReptileSelect } = result.current;

      render(
        <TestWrapper>
          <ReptileSelect value="reptile-1" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      // Expand Ball Python species group
      const ballPythonGroup = screen.getByText('Ball Python');
      fireEvent.click(ballPythonGroup);

      // Check that check icon is present for selected reptile
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('should handle multiple reptiles in same species', () => {
      const reptilesWithMultipleInSpecies: Reptile[] = [
        ...mockReptiles,
        {
          id: 'reptile-4',
          created_at: '2023-01-01T00:00:00Z',
          org_id: 'org-1',
          name: 'Snake 3',
          price: 150,
          reptile_code: 'BP003',
          species_id: '1', // Same species as reptile-1 and reptile-2
          morph_id: '1',
          visual_traits: null,
          het_traits: null,
          sex: 'female',
          weight: 550,
          length: 62,
          hatch_date: '2022-01-15',
          acquisition_date: '2023-01-01',
          status: 'active',
          notes: null,
          last_modified: '2023-01-01T00:00:00Z',
          original_breeder: null,
        },
      ];

      const { result } = renderHook(() => 
        useGroupedReptileBySpeciesSelect({ 
          filteredReptiles: reptilesWithMultipleInSpecies
        })
      );

      const { groupedReptiles } = result.current;
      const ballPythonGroup = groupedReptiles.find(group => group.label === 'Ball Python');
      
      expect(ballPythonGroup?.items).toHaveLength(3);
      expect(ballPythonGroup?.items.map(item => item.label)).toEqual(['Snake 1', 'Snake 2', 'Snake 3']);
    });
  });

  describe('memoization', () => {
    it('should memoize groupedReptiles when dependencies do not change', () => {
      const { result, rerender } = renderHook(
        ({ filteredReptiles }) => 
          useGroupedReptileBySpeciesSelect({ filteredReptiles }),
        {
          initialProps: { filteredReptiles: mockReptiles }
        }
      );

      const firstGroupedReptiles = result.current.groupedReptiles;

      // Rerender with same props
      rerender({ filteredReptiles: mockReptiles });

      const secondGroupedReptiles = result.current.groupedReptiles;
      expect(firstGroupedReptiles).toBe(secondGroupedReptiles);
    });

    it('should recalculate groupedReptiles when species change', () => {
      const { result, rerender } = renderHook(
        ({ filteredReptiles }) => 
          useGroupedReptileBySpeciesSelect({ filteredReptiles }),
        {
          initialProps: { filteredReptiles: mockReptiles }
        }
      );

      const firstGroupedReptiles = result.current.groupedReptiles;

      // Change species
      const newSpecies = [...mockSpecies, {
        id: 4,
        org_id: 'org-1',
        name: 'New Species',
        scientific_name: 'Newus species',
        care_level: 'beginner' as const,
      }];

      mockUseSpeciesStore.mockReturnValue({
        species: newSpecies,
      });

      rerender({ filteredReptiles: mockReptiles });

      const secondGroupedReptiles = result.current.groupedReptiles;
      expect(firstGroupedReptiles).not.toBe(secondGroupedReptiles);
    });

    it('should recalculate groupedReptiles when filteredReptiles change', () => {
      const { result, rerender } = renderHook(
        ({ filteredReptiles }) => 
          useGroupedReptileBySpeciesSelect({ filteredReptiles }),
        {
          initialProps: { filteredReptiles: mockReptiles }
        }
      );

      const firstGroupedReptiles = result.current.groupedReptiles;

      // Change filtered reptiles
      const newReptiles = [...mockReptiles, {
        id: 'reptile-4',
        created_at: '2023-01-01T00:00:00Z',
        org_id: 'org-1',
        name: 'New Snake',
        price: 300,
        reptile_code: 'BP004',
        species_id: '1',
        morph_id: '1',
        visual_traits: null,
        het_traits: null,
        sex: 'male' as const,
        weight: 700,
        length: 70,
        hatch_date: '2022-04-01',
        acquisition_date: '2023-01-01',
        status: 'active' as const,
        notes: null,
        last_modified: '2023-01-01T00:00:00Z',
        original_breeder: null,
      }];

      rerender({ filteredReptiles: newReptiles });

      const secondGroupedReptiles = result.current.groupedReptiles;
      expect(firstGroupedReptiles).not.toBe(secondGroupedReptiles);
    });
  });
});
