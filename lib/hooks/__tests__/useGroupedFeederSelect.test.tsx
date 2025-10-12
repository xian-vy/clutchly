import { renderHook, render, screen, fireEvent } from '@testing-library/react';
import { ReactNode, ComponentProps } from 'react';
import { useGroupedFeederSelect } from '@/lib/hooks/useGroupedFeederSelect';
import { FeederType, FeederSize } from '@/lib/types/feeders';

// Mock the dependencies
jest.mock('@/lib/stores/feedersStore', () => ({
  useFeedersStore: jest.fn(),
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

import { useFeedersStore } from '@/lib/stores/feedersStore';

const mockUseFeedersStore = useFeedersStore as jest.MockedFunction<typeof useFeedersStore>;

// Test data
const mockFeederTypes: FeederType[] = [
  {
    id: 'type-1',
    org_id: 'org-1',
    name: 'Mouse',
    description: 'Mouse feeders',
    is_global: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'type-2',
    org_id: 'org-1',
    name: 'Cricket',
    description: 'Cricket feeders',
    is_global: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'type-3',
    org_id: 'org-1',
    name: 'Mealworm',
    description: 'Mealworm feeders',
    is_global: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockFeederSizes: FeederSize[] = [
  {
    id: 'size-1',
    feeder_type_id: 'type-1',
    org_id: 'org-1',
    name: 'Pinky',
    description: 'Small mouse',
    is_global: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'size-2',
    feeder_type_id: 'type-1',
    org_id: 'org-1',
    name: 'Fuzzy',
    description: 'Medium mouse',
    is_global: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'size-3',
    feeder_type_id: 'type-2',
    org_id: 'org-1',
    name: 'Small',
    description: 'Small cricket',
    is_global: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'size-4',
    feeder_type_id: 'type-2',
    org_id: 'org-1',
    name: 'Large',
    description: 'Large cricket',
    is_global: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

describe('useGroupedFeederSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseFeedersStore.mockReturnValue({
      feederTypes: mockFeederTypes,
      feederSizes: mockFeederSizes,
    });
  });

  describe('groupedFeeders', () => {
    it('should group feeder sizes by feeder type correctly', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { groupedFeeders } = result.current;

      expect(groupedFeeders).toHaveLength(2); // 2 feeder types with sizes

      // Check Mouse group
      const mouseGroup = groupedFeeders.find(group => group.label === 'Mouse');
      expect(mouseGroup).toBeDefined();
      expect(mouseGroup?.items).toHaveLength(2);
      expect(mouseGroup?.items[0]).toEqual({
        value: 'size-1',
        label: 'Pinky',
      });
      expect(mouseGroup?.items[1]).toEqual({
        value: 'size-2',
        label: 'Fuzzy',
      });

      // Check Cricket group
      const cricketGroup = groupedFeeders.find(group => group.label === 'Cricket');
      expect(cricketGroup).toBeDefined();
      expect(cricketGroup?.items).toHaveLength(2);
      expect(cricketGroup?.items[0]).toEqual({
        value: 'size-3',
        label: 'Small',
      });
      expect(cricketGroup?.items[1]).toEqual({
        value: 'size-4',
        label: 'Large',
      });
    });

    it('should filter out feeder types with no sizes', () => {
      const feederTypesWithEmpty: FeederType[] = [
        ...mockFeederTypes,
        {
          id: 'type-4',
          org_id: 'org-1',
          name: 'Empty Type',
          description: 'No sizes',
          is_global: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseFeedersStore.mockReturnValue({
        feederTypes: feederTypesWithEmpty,
        feederSizes: mockFeederSizes,
      });

      const { result } = renderHook(() => useGroupedFeederSelect());

      const { groupedFeeders } = result.current;
      expect(groupedFeeders).toHaveLength(2); // Should not include Empty Type
      expect(groupedFeeders.find(group => group.label === 'Empty Type')).toBeUndefined();
    });

    it('should handle empty feeder sizes array', () => {
      mockUseFeedersStore.mockReturnValue({
        feederTypes: mockFeederTypes,
        feederSizes: [],
      });

      const { result } = renderHook(() => useGroupedFeederSelect());

      const { groupedFeeders } = result.current;
      expect(groupedFeeders).toHaveLength(0);
    });

    it('should handle empty feeder types array', () => {
      mockUseFeedersStore.mockReturnValue({
        feederTypes: [],
        feederSizes: mockFeederSizes,
      });

      const { result } = renderHook(() => useGroupedFeederSelect());

      const { groupedFeeders } = result.current;
      expect(groupedFeeders).toHaveLength(0);
    });

    it('should handle multiple sizes in same feeder type', () => {
      const feederSizesWithMultiple: FeederSize[] = [
        ...mockFeederSizes,
        {
          id: 'size-5',
          feeder_type_id: 'type-1', // Same type as size-1 and size-2
          org_id: 'org-1',
          name: 'Adult',
          description: 'Adult mouse',
          is_global: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseFeedersStore.mockReturnValue({
        feederTypes: mockFeederTypes,
        feederSizes: feederSizesWithMultiple,
      });

      const { result } = renderHook(() => useGroupedFeederSelect());

      const { groupedFeeders } = result.current;
      const mouseGroup = groupedFeeders.find(group => group.label === 'Mouse');
      
      expect(mouseGroup?.items).toHaveLength(3);
      expect(mouseGroup?.items.map(item => item.label)).toEqual(['Pinky', 'Fuzzy', 'Adult']);
    });
  });

  describe('FeederSelect component', () => {
    const TestWrapper = ({ children }: { children: ReactNode }) => <div>{children}</div>;

    it('should render with default placeholder', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText('Select feeder...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect 
            value="" 
            onValueChange={jest.fn()} 
            placeholder="Choose a feeder..." 
          />
        </TestWrapper>
      );

      expect(screen.getByText('Choose a feeder...')).toBeInTheDocument();
    });

    it('should display selected feeder with type and size', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect 
            value="size-1" 
            onValueChange={jest.fn()} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('Mouse > Pinky')).toBeInTheDocument();
    });

    it('should open popover when clicked', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      expect(popover).toHaveAttribute('data-open', 'false');

      fireEvent.click(popover);
      expect(popover).toHaveAttribute('data-open', 'true');
    });

    it('should render command input with correct placeholder', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      const commandInput = screen.getByTestId('command-input');
      expect(commandInput).toHaveAttribute('placeholder', 'Search species or reptiles...');
    });

    it('should render feeder type groups as command items', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('Cricket')).toBeInTheDocument();
    });

    it('should expand/collapse feeder type groups when clicked', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      // Initially, feeder size items should not be visible
      expect(screen.queryByText('Pinky')).not.toBeInTheDocument();

      // Click on Mouse feeder type group to expand
      const mouseGroup = screen.getByText('Mouse');
      fireEvent.click(mouseGroup);

      // Now feeder size items should be visible
      expect(screen.getByText('Pinky')).toBeInTheDocument();
      expect(screen.getByText('Fuzzy')).toBeInTheDocument();
    });

    it('should call onValueChange when feeder size is selected', () => {
      const mockOnValueChange = jest.fn();
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="" onValueChange={mockOnValueChange} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      // Expand Mouse feeder type group
      const mouseGroup = screen.getByText('Mouse');
      fireEvent.click(mouseGroup);

      // Click on Pinky
      const pinkyItem = screen.getByText('Pinky');
      fireEvent.click(pinkyItem);

      expect(mockOnValueChange).toHaveBeenCalledWith('size-1');
    });

    it('should show check icon for selected feeder size', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="size-1" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      // Expand Mouse feeder type group
      const mouseGroup = screen.getByText('Mouse');
      fireEvent.click(mouseGroup);

      // Check that check icon is present for selected feeder size
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('should handle multiple feeder sizes in same type', () => {
      const feederSizesWithMultiple: FeederSize[] = [
        ...mockFeederSizes,
        {
          id: 'size-5',
          feeder_type_id: 'type-1', // Same type as size-1 and size-2
          org_id: 'org-1',
          name: 'Adult',
          description: 'Adult mouse',
          is_global: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseFeedersStore.mockReturnValue({
        feederTypes: mockFeederTypes,
        feederSizes: feederSizesWithMultiple,
      });

      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect value="" onValueChange={jest.fn()} />
        </TestWrapper>
      );

      const popover = screen.getByTestId('popover');
      fireEvent.click(popover);

      // Expand Mouse feeder type group
      const mouseGroup = screen.getByText('Mouse');
      fireEvent.click(mouseGroup);

      // Check all sizes are visible
      expect(screen.getByText('Pinky')).toBeInTheDocument();
      expect(screen.getByText('Fuzzy')).toBeInTheDocument();
      expect(screen.getByText('Adult')).toBeInTheDocument();
    });

    it('should display correct selected label format', () => {
      const { result } = renderHook(() => useGroupedFeederSelect());

      const { FeederSelect } = result.current;

      render(
        <TestWrapper>
          <FeederSelect 
            value="size-3" 
            onValueChange={jest.fn()} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('Cricket > Small')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('should memoize groupedFeeders when dependencies do not change', () => {
      const { result, rerender } = renderHook(() => useGroupedFeederSelect());

      const firstGroupedFeeders = result.current.groupedFeeders;

      // Rerender with same data
      rerender();

      const secondGroupedFeeders = result.current.groupedFeeders;
      expect(firstGroupedFeeders).toBe(secondGroupedFeeders);
    });

    it('should recalculate groupedFeeders when feederTypes change', () => {
      const { result, rerender } = renderHook(() => useGroupedFeederSelect());

      const firstGroupedFeeders = result.current.groupedFeeders;

      // Change feeder types
      const newFeederTypes = [...mockFeederTypes, {
        id: 'type-4',
        org_id: 'org-1',
        name: 'New Type',
        description: 'New feeder type',
        is_global: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }];

      mockUseFeedersStore.mockReturnValue({
        feederTypes: newFeederTypes,
        feederSizes: mockFeederSizes,
      });

      rerender();

      const secondGroupedFeeders = result.current.groupedFeeders;
      expect(firstGroupedFeeders).not.toBe(secondGroupedFeeders);
    });

    it('should recalculate groupedFeeders when feederSizes change', () => {
      const { result, rerender } = renderHook(() => useGroupedFeederSelect());

      const firstGroupedFeeders = result.current.groupedFeeders;

      // Change feeder sizes
      const newFeederSizes = [...mockFeederSizes, {
        id: 'size-5',
        feeder_type_id: 'type-1',
        org_id: 'org-1',
        name: 'New Size',
        description: 'New feeder size',
        is_global: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }];

      mockUseFeedersStore.mockReturnValue({
        feederTypes: mockFeederTypes,
        feederSizes: newFeederSizes,
      });

      rerender();

      const secondGroupedFeeders = result.current.groupedFeeders;
      expect(firstGroupedFeeders).not.toBe(secondGroupedFeeders);
    });
  });
});
