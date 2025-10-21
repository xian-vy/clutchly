import { renderHook } from "@testing-library/react";
import { useSortedSpecies } from "@/lib/hooks/useSortedSpecies";
import { Species } from "@/lib/types/species";

// Test data
const mockSpecies: Species[] = [
  {
    id: 1,
    org_id: "org-1",
    name: "Ball Python",
    scientific_name: "Python regius",
    care_level: "beginner",
    is_global: true,
  },
  {
    id: 2,
    org_id: "org-1",
    name: "Corn Snake",
    scientific_name: "Pantherophis guttatus",
    care_level: "beginner",
    is_global: true,
  },
  {
    id: 3,
    org_id: "org-1",
    name: "Green Tree Python",
    scientific_name: "Morelia viridis",
    care_level: "advanced",
    is_global: true,
  },
  {
    id: 4,
    org_id: "org-1",
    name: "Leopard Gecko",
    scientific_name: "Eublepharis macularius",
    care_level: "beginner",
    is_global: true,
  },
  {
    id: 5,
    org_id: "org-1",
    name: "Bearded Dragon",
    scientific_name: "Pogona vitticeps",
    care_level: "intermediate",
    is_global: true,
  },
];

describe("useSortedSpecies", () => {
  describe("sorting behavior", () => {
    it("should sort species alphabetically when no species are selected", () => {
      const { result } = renderHook(() => useSortedSpecies(mockSpecies, []));

      const sortedSpecies = result.current;

      expect(sortedSpecies).toHaveLength(5);
      expect(sortedSpecies[0].name).toBe("Ball Python");
      expect(sortedSpecies[1].name).toBe("Bearded Dragon");
      expect(sortedSpecies[2].name).toBe("Corn Snake");
      expect(sortedSpecies[3].name).toBe("Green Tree Python");
      expect(sortedSpecies[4].name).toBe("Leopard Gecko");
    });

    it("should put selected species first, then sort alphabetically", () => {
      const { result } = renderHook(
        () => useSortedSpecies(mockSpecies, [3, 1]) // Green Tree Python and Ball Python selected
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies).toHaveLength(5);
      // Selected species should come first
      expect(sortedSpecies[0].name).toBe("Ball Python");
      expect(sortedSpecies[1].name).toBe("Green Tree Python");
      // Non-selected species should follow alphabetically
      expect(sortedSpecies[2].name).toBe("Bearded Dragon");
      expect(sortedSpecies[3].name).toBe("Corn Snake");
      expect(sortedSpecies[4].name).toBe("Leopard Gecko");
    });

    it("should handle single selected species", () => {
      const { result } = renderHook(
        () => useSortedSpecies(mockSpecies, [4]) // Leopard Gecko selected
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies).toHaveLength(5);
      expect(sortedSpecies[0].name).toBe("Leopard Gecko");
      // Rest should be alphabetical
      expect(sortedSpecies[1].name).toBe("Ball Python");
      expect(sortedSpecies[2].name).toBe("Bearded Dragon");
      expect(sortedSpecies[3].name).toBe("Corn Snake");
      expect(sortedSpecies[4].name).toBe("Green Tree Python");
    });

    it("should handle all species selected", () => {
      const { result } = renderHook(() =>
        useSortedSpecies(mockSpecies, [1, 2, 3, 4, 5])
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies).toHaveLength(5);
      // All should be selected, so they should be in alphabetical order
      expect(sortedSpecies[0].name).toBe("Ball Python");
      expect(sortedSpecies[1].name).toBe("Bearded Dragon");
      expect(sortedSpecies[2].name).toBe("Corn Snake");
      expect(sortedSpecies[3].name).toBe("Green Tree Python");
      expect(sortedSpecies[4].name).toBe("Leopard Gecko");
    });
  });

  describe("id type handling", () => {
    it("should handle string IDs in selectedSpeciesIds", () => {
      const { result } = renderHook(
        () => useSortedSpecies(mockSpecies, ["3", "1"]) // String IDs
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies[0].name).toBe("Ball Python");
      expect(sortedSpecies[1].name).toBe("Green Tree Python");
    });

    it("should handle mixed string and number IDs", () => {
      const { result } = renderHook(
        () => useSortedSpecies(mockSpecies, [3, "1"]) // Mixed types
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies[0].name).toBe("Ball Python");
      expect(sortedSpecies[1].name).toBe("Green Tree Python");
    });

    it("should handle undefined selectedSpeciesIds", () => {
      const { result } = renderHook(() =>
        useSortedSpecies(mockSpecies, undefined)
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies).toHaveLength(5);
      expect(sortedSpecies[0].name).toBe("Ball Python");
    });
  });

  describe("edge cases", () => {
    it("should handle empty species array", () => {
      const { result } = renderHook(() => useSortedSpecies([], []));

      const sortedSpecies = result.current;
      expect(sortedSpecies).toHaveLength(0);
    });

    it("should handle empty selectedSpeciesIds array", () => {
      const { result } = renderHook(() => useSortedSpecies(mockSpecies, []));

      const sortedSpecies = result.current;
      expect(sortedSpecies).toHaveLength(5);
      expect(sortedSpecies[0].name).toBe("Ball Python");
    });

    it("should handle non-existent IDs in selectedSpeciesIds", () => {
      const { result } = renderHook(
        () => useSortedSpecies(mockSpecies, [999, 1]) // 999 doesn't exist
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies).toHaveLength(5);
      // Only Ball Python should be selected (ID 1)
      expect(sortedSpecies[0].name).toBe("Ball Python");
      expect(sortedSpecies[1].name).toBe("Bearded Dragon");
    });

    it("should not mutate original species array", () => {
      const originalSpecies = [...mockSpecies];
      const { result } = renderHook(() =>
        useSortedSpecies(mockSpecies, [1, 3])
      );

      // Trigger the hook to ensure it runs
      void result.current;

      expect(mockSpecies).toEqual(originalSpecies);
    });
  });

  describe("memoization", () => {
    it("should return same reference when dependencies do not change", () => {
      const selectedIds = [1, 3];
      const { result, rerender } = renderHook(
        ({ species, selectedIds }) => useSortedSpecies(species, selectedIds),
        {
          initialProps: { species: mockSpecies, selectedIds },
        }
      );

      const firstResult = result.current;
      rerender({ species: mockSpecies, selectedIds });
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it("should return new reference when species array changes", () => {
      const { result, rerender } = renderHook(
        ({ species, selectedIds }) => useSortedSpecies(species, selectedIds),
        {
          initialProps: { species: mockSpecies, selectedIds: [1, 3] },
        }
      );

      const firstResult = result.current;

      const newSpecies = [
        ...mockSpecies,
        {
          id: 6,
          org_id: "org-1",
          name: "New Species",
          scientific_name: "New species",
          care_level: "beginner" as const,
          is_global: true,
        },
      ];

      rerender({ species: newSpecies, selectedIds: [1, 3] });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });

    it("should return new reference when selectedSpeciesIds changes", () => {
      const { result, rerender } = renderHook(
        ({ species, selectedIds }) => useSortedSpecies(species, selectedIds),
        {
          initialProps: { species: mockSpecies, selectedIds: [1, 3] },
        }
      );

      const firstResult = result.current;

      rerender({ species: mockSpecies, selectedIds: [1, 2, 3] });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });
  });

  describe("complex sorting scenarios", () => {
    it("should maintain alphabetical order within selected and non-selected groups", () => {
      const { result } = renderHook(
        () => useSortedSpecies(mockSpecies, [5, 1]) // Bearded Dragon and Ball Python selected
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies).toHaveLength(5);
      // Selected species in alphabetical order
      expect(sortedSpecies[0].name).toBe("Ball Python");
      expect(sortedSpecies[1].name).toBe("Bearded Dragon");
      // Non-selected species in alphabetical order
      expect(sortedSpecies[2].name).toBe("Corn Snake");
      expect(sortedSpecies[3].name).toBe("Green Tree Python");
      expect(sortedSpecies[4].name).toBe("Leopard Gecko");
    });

    it("should handle case sensitivity in species names", () => {
      const speciesWithCaseVariations: Species[] = [
        {
          id: 1,
          org_id: "org-1",
          name: "ball python",
          scientific_name: "Python regius",
          care_level: "beginner",
          is_global: true,
        },
        {
          id: 2,
          org_id: "org-1",
          name: "Ball Python",
          scientific_name: "Python regius",
          care_level: "beginner",
          is_global: true,
        },
        {
          id: 3,
          org_id: "org-1",
          name: "BALL PYTHON",
          scientific_name: "Python regius",
          care_level: "beginner",
          is_global: true,
        },
      ];

      const { result } = renderHook(() =>
        useSortedSpecies(speciesWithCaseVariations, [])
      );

      const sortedSpecies = result.current;

      expect(sortedSpecies[0].name).toBe("ball python");
      expect(sortedSpecies[1].name).toBe("Ball Python");
      expect(sortedSpecies[2].name).toBe("BALL PYTHON");
    });
  });
});
