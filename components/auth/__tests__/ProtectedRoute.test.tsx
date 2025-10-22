import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ProtectedRoute from "../ProtectedRoute";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/hooks/useAccessControl", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("@/app/api/users/access", () => ({
  getPages: jest.fn(),
}));

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

// Import mocked modules
import { useRouter } from "next/navigation";
import useAccessControl from "@/lib/hooks/useAccessControl";
import { useAuthStore } from "@/lib/stores/authStore";
import { getPages } from "@/app/api/users/access";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAccessControl = useAccessControl as jest.MockedFunction<
  typeof useAccessControl
>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockGetPages = getPages as jest.MockedFunction<typeof getPages>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

// Mock data
const mockUser = {
  id: "user-1",
  org_id: "org-1",
  role: "user",
  access_profile_id: "profile-1",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  created_at: "2023-01-01",
  updated_at: "2023-01-01",
};

const mockOrgOwner = {
  id: "org-1",
  org_id: "org-1",
  role: "admin",
  access_profile_id: "profile-1",
  email: "owner@example.com",
  first_name: "Owner",
  last_name: "User",
  created_at: "2023-01-01",
  updated_at: "2023-01-01",
};

const mockPages = [
  { id: "page-1", name: "Reptiles", section: "animals" },
  { id: "page-2", name: "Health", section: "animals" },
  { id: "page-3", name: "Users", section: "admin" },
];

const mockAccessProfile = {
  id: "profile-1",
  name: "Standard User",
  description: "Standard user access",
  org_id: "org-1",
  created_at: "2023-01-01",
  updated_at: "2023-01-01",
  access_controls: [
    {
      id: "ac-1",
      access_profile_id: "profile-1",
      page_id: "page-1",
      can_view: true,
      can_edit: false,
      can_delete: false,
      created_at: "2023-01-01",
      updated_at: "2023-01-01",
    },
    {
      id: "ac-2",
      access_profile_id: "profile-1",
      page_id: "page-2",
      can_view: true,
      can_edit: true,
      can_delete: false,
      created_at: "2023-01-01",
      updated_at: "2023-01-01",
    },
  ],
};

const createMockQueryResult = <T,>(
  data: T,
  isLoading: boolean = false,
  error: Error | null = null
): UseQueryResult<T, Error> =>
  ({
    data,
    isLoading,
    error,
    isError: !!error,
    isSuccess: !isLoading && !error,
    isPending: isLoading,
    isFetching: false,
    isRefetching: false,
    isStale: false,
    isPlaceholderData: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isRefetchError: false,
    isInitialLoading: false,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    refetch: jest.fn(),
    status: isLoading ? "pending" : error ? "error" : "success",
    isLoadingError: null,
    isPaused: false,
    fetchStatus: "idle",
    promise: Promise.resolve(),
  } as unknown as UseQueryResult<T, Error>);

describe("ProtectedRoute", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockGetPages.mockResolvedValue(mockPages);
    mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));
  });

  describe("Loading States", () => {
    it("shows loading spinner when user is loading", () => {
      mockUseAuthStore.mockReturnValue({
        user: undefined,
        isLoading: true,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: jest.fn(),
        filterNavItems: jest.fn(),
        accessProfile: null,
        isLoading: false,
      });

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText("Checking access...")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("shows loading spinner when access control is loading", () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: jest.fn(),
        filterNavItems: jest.fn(),
        accessProfile: null,
        isLoading: true,
      });

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText("Checking access...")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("shows loading spinner when pages are loading", () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: jest.fn(),
        filterNavItems: jest.fn(),
        accessProfile: null,
        isLoading: false,
      });

      // Mock pages query to be loading
      mockUseQuery.mockReturnValue(createMockQueryResult(undefined, true));

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText("Checking access...")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("Access Control Logic", () => {
    it("renders children when user has access to the page", async () => {
      const mockHasAccess = jest.fn().mockReturnValue(true);

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: mockHasAccess,
        filterNavItems: jest.fn(),
        accessProfile: mockAccessProfile,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });

      expect(mockHasAccess).toHaveBeenCalledWith("page-1", "view");
    });

    it("redirects to overview when user does not have access", async () => {
      const mockHasAccess = jest.fn().mockReturnValue(false);

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: mockHasAccess,
        filterNavItems: jest.fn(),
        accessProfile: mockAccessProfile,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/overview");
      });

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("does not render children when access is denied", async () => {
      const mockHasAccess = jest.fn().mockReturnValue(false);

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: mockHasAccess,
        filterNavItems: jest.fn(),
        accessProfile: mockAccessProfile,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      });
    });
  });

  describe("Users Page Special Case", () => {
    it("allows access to users page for organization owner", async () => {
      mockUseAuthStore.mockReturnValue({
        user: mockOrgOwner,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: jest.fn(),
        filterNavItems: jest.fn(),
        accessProfile: null,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="users">
          <div>Users Page Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText("Users Page Content")).toBeInTheDocument();
      });

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("denies access to users page for non-organization owner", async () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: jest.fn(),
        filterNavItems: jest.fn(),
        accessProfile: mockAccessProfile,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="users">
          <div>Users Page Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/overview");
      });

      expect(screen.queryByText("Users Page Content")).not.toBeInTheDocument();
    });
  });

  describe("Page Name Matching", () => {
    it("matches page names case-insensitively", async () => {
      const mockHasAccess = jest.fn().mockReturnValue(true);

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: mockHasAccess,
        filterNavItems: jest.fn(),
        accessProfile: mockAccessProfile,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="REPTILES">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });

      expect(mockHasAccess).toHaveBeenCalledWith("page-1", "view");
    });

    it("handles page not found in pages array", async () => {
      const mockHasAccess = jest.fn().mockReturnValue(false);

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: mockHasAccess,
        filterNavItems: jest.fn(),
        accessProfile: mockAccessProfile,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="nonexistent">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/overview");
      });

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined user gracefully", async () => {
      mockUseAuthStore.mockReturnValue({
        user: undefined,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: jest.fn(),
        filterNavItems: jest.fn(),
        accessProfile: null,
        isLoading: false,
      });

      // Mock pages query to return data
      mockUseQuery.mockReturnValue(createMockQueryResult(mockPages));

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/overview");
      });

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("handles empty pages array", async () => {
      const mockHasAccess = jest.fn().mockReturnValue(false);

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isLoading: false,
        organization: undefined,
        isLoggingOut: false,
        error: null,
        fetchUserAndOrg: jest.fn(),
        setUser: jest.fn(),
        setOrganization: jest.fn(),
        setIsLoggingOut: jest.fn(),
        clearAuth: jest.fn(),
        resetLoadingStates: jest.fn(),
        logoutUser: jest.fn(),
      });

      mockUseAccessControl.mockReturnValue({
        hasAccess: mockHasAccess,
        filterNavItems: jest.fn(),
        accessProfile: mockAccessProfile,
        isLoading: false,
      });

      // Mock pages query to return empty array
      mockUseQuery.mockReturnValue(createMockQueryResult([]));

      render(
        <ProtectedRoute pageName="reptiles">
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/overview");
      });

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });
});
