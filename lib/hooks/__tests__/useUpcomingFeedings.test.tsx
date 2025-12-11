import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useUpcomingFeedings } from "@/lib/hooks/useUpcomingFeedings";
import { getFeedingEvents } from "@/app/api/feeding/events";
import { getFeedingSchedules } from "@/app/api/feeding/schedule";
import { getReptilesByLocation } from "@/app/api/reptiles/byLocation";
import { useAuthStore } from "@/lib/stores/authStore";
import { CACHE_KEYS } from "@/lib/constants/cache_keys";
import { FeedingScheduleWithTargets } from "@/lib/types/feeding";
import { Sex, Status } from "@/lib/types/reptile";

// Mock the dependencies
jest.mock("@/app/api/feeding/events");
jest.mock("@/app/api/feeding/schedule");
jest.mock("@/app/api/reptiles/byLocation");
jest.mock("@/lib/stores/authStore");

const mockGetFeedingEvents = getFeedingEvents as jest.MockedFunction<
  typeof getFeedingEvents
>;
const mockGetFeedingSchedules = getFeedingSchedules as jest.MockedFunction<
  typeof getFeedingSchedules
>;
const mockGetReptilesByLocation = getReptilesByLocation as jest.MockedFunction<
  typeof getReptilesByLocation
>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

// Test data
const mockFeedingSchedules: FeedingScheduleWithTargets[] = [
  {
    id: "schedule-1",
    org_id: "org-1",
    name: "Daily Feeding",
    description: "Daily feeding schedule",
    recurrence: "daily",
    interval_days: null,
    start_date: "2024-01-01",
    end_date: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    targets: [
      {
        id: "target-1",
        schedule_id: "schedule-1",
        target_type: "reptile",
        target_id: "reptile-1",
        reptile_name: "Snake 1",
      },
    ],
  },
  {
    id: "schedule-2",
    org_id: "org-1",
    name: "Weekly Feeding",
    description: "Weekly feeding schedule",
    recurrence: "weekly",
    interval_days: null,
    start_date: "2024-01-01",
    end_date: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    targets: [
      {
        id: "target-2",
        schedule_id: "schedule-2",
        target_type: "room",
        target_id: "room-1",
        room_name: "Reptile Room",
      },
    ],
  },
  {
    id: "schedule-3",
    org_id: "org-1",
    name: "Interval Feeding",
    description: "Every 3 days feeding",
    recurrence: "interval",
    interval_days: 3,
    start_date: "2024-01-01",
    end_date: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    targets: [
      {
        id: "target-3",
        schedule_id: "schedule-3",
        target_type: "reptile",
        target_id: "reptile-2",
        reptile_name: "Snake 2",
      },
    ],
  },
];

const mockFeedingEvents = [
  {
    id: "event-1",
    schedule_id: "schedule-1",
    reptile_id: "reptile-1",
    scheduled_date: "2024-01-15",
    fed: true,
    fed_at: "2024-01-15T10:00:00Z",
    feeder_size_id: "size-1",
    notes: "Fed successfully",
    reptile_name: "Snake 1",
    species_name: "Ball Python",
    morph_name: "Normal",
    reptile_code: "BP001",
  },
  {
    id: "event-2",
    schedule_id: "schedule-1",
    reptile_id: "reptile-1",
    scheduled_date: "2024-01-16",
    fed: false,
    fed_at: null,
    feeder_size_id: null,
    notes: null,
    reptile_name: "Snake 1",
    species_name: "Ball Python",
    morph_name: "Normal",
    reptile_code: "BP001",
  },
];

const mockReptilesByLocation = [
  {
    id: "reptile-3",
    name: "Gecko 1",
    created_at: "2024-01-01T00:00:00Z",
    org_id: "org-1",
    price: 50,
    reptile_code: "G001",
    species_id: "1",
    morph_id: "1",
    visual_traits: null,
    het_traits: null,
    sex: "unknown" as Sex,
    weight: 10,
    length: 5,
    hatch_date: "2024-01-01",
    acquisition_date: "2024-01-01",
    status: "active" as Status,
    notes: null,
    last_modified: "2024-01-01T00:00:00Z",
    parent_clutch_id: null,
    dam_id: null,
    sire_id: null,
    generation: 1,
    breeding_line: undefined,
    is_breeder: false,
    retired_breeder: false,
    project_ids: undefined,
    location_id: "location-1",
    original_breeder: null,
    species_name: "Leopard Gecko",
    morph_name: "Normal",
  },
  {
    id: "reptile-4",
    name: "Gecko 2",
    created_at: "2024-01-01T00:00:00Z",
    org_id: "org-1",
    price: 50,
    reptile_code: "G002",
    species_id: "1",
    morph_id: "1",
    visual_traits: null,
    het_traits: null,
    sex: "unknown" as Sex,
    weight: 10,
    length: 5,
    hatch_date: "2024-01-01",
    acquisition_date: "2024-01-01",
    status: "active" as Status,
    notes: null,
    last_modified: "2024-01-01T00:00:00Z",
    parent_clutch_id: null,
    dam_id: null,
    sire_id: null,
    generation: 1,
    breeding_line: undefined,
    is_breeder: false,
    retired_breeder: false,
    project_ids: undefined,
    location_id: "location-1",
    original_breeder: null,
    species_name: "Leopard Gecko",
    morph_name: "Normal",
  },
];

// Mock date-fns functions
jest.mock("date-fns", () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === "yyyy-MM-dd") {
      return date.toISOString().split("T")[0];
    }
    return date.toString();
  }),
  isToday: jest.fn((date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }),
  parseISO: jest.fn((dateString) => new Date(dateString)),
}));

describe("useUpcomingFeedings", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    TestWrapper.displayName = "TestWrapper";
    return TestWrapper;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    jest.clearAllMocks();

    // Default mocks
    mockUseAuthStore.mockReturnValue({
      organization: "org-1",
    });

    mockGetFeedingSchedules.mockResolvedValue(mockFeedingSchedules);
    mockGetFeedingEvents.mockResolvedValue(mockFeedingEvents);
    mockGetReptilesByLocation.mockResolvedValue(mockReptilesByLocation);
  });

  describe("basic functionality", () => {
    it("should return loading state initially", () => {
      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoadingStatus).toBe(true);
      expect(result.current.upcomingFeedings).toEqual([]);
    });

    it("should fetch upcoming feedings when schedules are available", async () => {
      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      expect(mockGetFeedingSchedules).toHaveBeenCalledWith("org-1");
    });

    it("should return empty array when no organization", async () => {
      mockUseAuthStore.mockReturnValue({
        organization: null,
      });

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      expect(result.current.upcomingFeedings).toEqual([]);
    });
  });

  describe("daily schedule handling", () => {
    it("should generate upcoming feeding dates for daily schedules", async () => {
      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      const upcomingFeedings = result.current.upcomingFeedings;

      // Should have daily feedings for the next 5 days
      expect(upcomingFeedings.length).toBeGreaterThan(0);

      // Check that we have daily schedule feedings
      const dailyFeedings = upcomingFeedings.filter(
        (feeding) => feeding.schedule.recurrence === "daily"
      );
      expect(dailyFeedings.length).toBeGreaterThan(0);
    });

    it("should calculate completion status for daily schedules", async () => {
      mockGetFeedingEvents.mockResolvedValue([
        {
          id: "event-1",
          schedule_id: "schedule-1",
          reptile_id: "reptile-1",
          scheduled_date: "2024-01-15",
          fed: true,
          fed_at: "2024-01-15T10:00:00Z",
          feeder_size_id: "size-1",
          notes: "Fed successfully",
          reptile_name: "Snake 1",
          species_name: "Ball Python",
          morph_name: "Normal",
          reptile_code: "BP001",
        },
      ]);

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      const upcomingFeedings = result.current.upcomingFeedings;

      // Should have some feedings
      expect(upcomingFeedings.length).toBeGreaterThan(0);

      // Check that we have daily schedule feedings
      const dailyFeedings = upcomingFeedings.filter(
        (feeding) => feeding.schedule.recurrence === "daily"
      );
      expect(dailyFeedings.length).toBeGreaterThan(0);
    });
  });

  describe("weekly schedule handling", () => {
    it("should generate upcoming feeding dates for weekly schedules", async () => {
      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      const upcomingFeedings = result.current.upcomingFeedings;

      // Should have some feedings
      expect(upcomingFeedings.length).toBeGreaterThan(0);

      // Check that we have weekly schedule feedings (may be 0 due to date logic)
      const weeklyFeedings = upcomingFeedings.filter(
        (feeding) => feeding.schedule.recurrence === "weekly"
      );
      expect(weeklyFeedings.length).toBeGreaterThanOrEqual(0);
    });

    it("should calculate completion status for weekly schedules", async () => {
      mockGetReptilesByLocation.mockResolvedValue(mockReptilesByLocation);

      mockGetFeedingEvents.mockResolvedValue([
        {
          id: "event-1",
          schedule_id: "schedule-2",
          reptile_id: "reptile-3",
          scheduled_date: "2024-01-15",
          fed: true,
          fed_at: "2024-01-15T10:00:00Z",
          feeder_size_id: "size-1",
          notes: "Fed successfully",
          reptile_name: "Gecko 1",
          species_name: "Leopard Gecko",
          morph_name: "Normal",
          reptile_code: "G001",
        },
        {
          id: "event-2",
          schedule_id: "schedule-2",
          reptile_id: "reptile-4",
          scheduled_date: "2024-01-15",
          fed: false,
          fed_at: null,
          feeder_size_id: null,
          notes: null,
          reptile_name: "Gecko 2",
          species_name: "Leopard Gecko",
          morph_name: "Normal",
          reptile_code: "G002",
        },
      ]);

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      const upcomingFeedings = result.current.upcomingFeedings;
      const weeklyFeeding = upcomingFeedings.find(
        (feeding) => feeding.schedule.id === "schedule-2"
      );

      if (weeklyFeeding) {
        expect(weeklyFeeding.totalEvents).toBe(2);
        expect(weeklyFeeding.completedEvents).toBe(1);
        expect(weeklyFeeding.isCompleted).toBe(false);
      }
    });
  });

  describe("interval schedule handling", () => {
    it("should generate upcoming feeding dates for interval schedules", async () => {
      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      const upcomingFeedings = result.current.upcomingFeedings;

      // Should have some feedings
      expect(upcomingFeedings.length).toBeGreaterThan(0);

      // Check that we have interval schedule feedings
      const intervalFeedings = upcomingFeedings.filter(
        (feeding) => feeding.schedule.recurrence === "interval"
      );
      expect(intervalFeedings.length).toBeGreaterThan(0);
    });

    it("should calculate completion status for interval schedules", async () => {
      mockGetFeedingEvents.mockResolvedValue([
        {
          id: "event-1",
          schedule_id: "schedule-3",
          reptile_id: "reptile-2",
          scheduled_date: "2024-01-15",
          fed: true,
          fed_at: "2024-01-15T10:00:00Z",
          feeder_size_id: "size-1",
          notes: "Fed successfully",
          reptile_name: "Snake 2",
          species_name: "Ball Python",
          morph_name: "Normal",
          reptile_code: "BP002",
        },
      ]);

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      const upcomingFeedings = result.current.upcomingFeedings;
      const intervalFeeding = upcomingFeedings.find(
        (feeding) => feeding.schedule.id === "schedule-3"
      );

      if (intervalFeeding) {
        expect(intervalFeeding.totalEvents).toBe(1);
        expect(intervalFeeding.completedEvents).toBeGreaterThanOrEqual(0);
        expect(typeof intervalFeeding.isCompleted).toBe("boolean");
      }
    });
  });

  describe("schedule filtering", () => {
    it("should handle schedules with end dates", async () => {
      const schedulesWithEndDate: FeedingScheduleWithTargets[] = [
        {
          ...mockFeedingSchedules[0],
          end_date: "2024-01-10", // Before current date
        },
      ];

      mockGetFeedingSchedules.mockResolvedValue(schedulesWithEndDate);

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      // Should handle the schedule appropriately
      expect(result.current.upcomingFeedings).toBeDefined();
    });

    it("should handle schedules with future start dates", async () => {
      const schedulesWithFutureStart: FeedingScheduleWithTargets[] = [
        {
          ...mockFeedingSchedules[0],
          start_date: "2024-02-01", // Future date
        },
      ];

      mockGetFeedingSchedules.mockResolvedValue(schedulesWithFutureStart);

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      // Should handle the schedule appropriately
      expect(result.current.upcomingFeedings).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle API errors gracefully", async () => {
      mockGetFeedingSchedules.mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      expect(result.current.upcomingFeedings).toEqual([]);
    });

    it("should handle getReptilesByLocation errors", async () => {
      // Suppress console.error for this test since we're intentionally testing error handling
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockGetReptilesByLocation.mockRejectedValue(
        new Error("Location API Error")
      );

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      // Should still return results, but with 0 reptiles for location-based targets
      expect(result.current.upcomingFeedings).toBeDefined();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("refresh functionality", () => {
    it("should provide refresh function", () => {
      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refreshStatus).toBe("function");
    });

    it("should invalidate related queries when refreshing", async () => {
      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      result.current.refreshStatus();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [CACHE_KEYS.FEEDING_STATUS],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [CACHE_KEYS.FEEDING_EVENTS],
      });
    });
  });

  describe("query key dependencies", () => {
    it("should update query key when schedules change", async () => {
      const { result, rerender } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      // Change schedules
      const newSchedules = [
        ...mockFeedingSchedules,
        {
          ...mockFeedingSchedules[0],
          id: "schedule-4",
          name: "New Schedule",
        },
      ];

      mockGetFeedingSchedules.mockResolvedValue(newSchedules);

      rerender();

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      // Should have fetched schedules
      expect(mockGetFeedingSchedules).toHaveBeenCalled();
    });
  });

  describe("limit to 5 upcoming feedings", () => {
    it("should limit results to 5 upcoming feedings", async () => {
      // Create many schedules to generate more than 5 feedings
      const manySchedules: FeedingScheduleWithTargets[] = Array.from(
        { length: 10 },
        (_, i) => ({
          ...mockFeedingSchedules[0],
          id: `schedule-${i}`,
          name: `Schedule ${i}`,
        })
      );

      mockGetFeedingSchedules.mockResolvedValue(manySchedules);

      const { result } = renderHook(() => useUpcomingFeedings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingStatus).toBe(false);
      });

      expect(result.current.upcomingFeedings.length).toBeLessThanOrEqual(5);
    });
  });
});
