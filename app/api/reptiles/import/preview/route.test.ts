
jest.mock('@/app/api/utils_server', () => ({
  getUserAndOrganizationInfo: jest.fn(),
  getSubscriptionLimit: jest.fn(),
  getReptileCount: jest.fn(),
}))

jest.mock('@/app/api/reptiles/import/utils', () => ({
  checkRateLimit: jest.fn(),
  validateReptileRow: jest.fn(),
}))

jest.mock('papaparse', () => ({
  parse: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ),
  },
}))

import { POST } from './route';
import { NextResponse } from 'next/server';
import * as utilsServer from '@/app/api/utils_server';
import * as importUtils from '@/app/api/reptiles/import/utils';
import * as PapaModule from 'papaparse';

describe('Import Preview Route POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildRequestWithFormData(formData: FormData): unknown {
    return {
      formData: async () => formData,
    };
  }

  function lastJsonCall(): { body: unknown; init?: { status?: number } } {
    const calls = (NextResponse.json as jest.Mock).mock.calls as Array<[unknown, { status?: number }?]>;
    const [body, init] = calls[calls.length - 1];
    return { body, init };
  }

  function withText(file: File, content: string): File {
    if (typeof (file as { text?: () => Promise<string> }).text !== 'function') {
      Object.defineProperty(file, 'text', {
        value: async () => content,
      });
    }
    return file;
  }

  test('returns 401 when no organization (auth required)', async () => {
    (utilsServer.getUserAndOrganizationInfo as jest.Mock).mockResolvedValue({ organization: null });
    const req = buildRequestWithFormData(new FormData());
    // @ts-expect-error: casting minimal request shape to NextRequest for handler
    await POST(req);
    const { body, init } = lastJsonCall();
    expect(init?.status).toBe(401);
    expect((body as { error: string }).error).toMatch(/Authentication required/i);
  });

  test('returns 429 when rate limit exceeded', async () => {
    (utilsServer.getUserAndOrganizationInfo as jest.Mock).mockResolvedValue({ organization: { id: 'org1' } });
    (importUtils.checkRateLimit as jest.Mock).mockResolvedValue(false);
    const req = buildRequestWithFormData(new FormData());
    // @ts-expect-error minimal request
    await POST(req);
    const { body, init } = lastJsonCall();
    expect(init?.status).toBe(429);
    expect((body as { error: string }).error).toMatch(/Rate limit/i);
  });

  test('returns 400 when no file provided', async () => {
    (utilsServer.getUserAndOrganizationInfo as jest.Mock).mockResolvedValue({ organization: { id: 'org1' } });
    (importUtils.checkRateLimit as jest.Mock).mockResolvedValue(true);
    const req = buildRequestWithFormData(new FormData());
    // @ts-expect-error minimal request
    await POST(req);
    const { body, init } = lastJsonCall();
    expect(init?.status).toBe(400);
    expect((body as { error: string }).error).toMatch(/No file provided/i);
  });

  test('returns 400 when file exceeds 2MB', async () => {
    (utilsServer.getUserAndOrganizationInfo as jest.Mock).mockResolvedValue({ organization: { id: 'org1' } });
    (importUtils.checkRateLimit as jest.Mock).mockResolvedValue(true);
    const bigContent = 'x'.repeat(2 * 1024 * 1024 + 1);
    const file = new File([bigContent], 'big.csv', { type: 'text/csv' });
    const fd = new FormData();
    fd.append('file', file);
    const req = buildRequestWithFormData(fd);
    // @ts-expect-error minimal request
    await POST(req);
    const { body, init } = lastJsonCall();
    expect(init?.status).toBe(400);
    expect((body as { error: string }).error).toMatch(/maximum size of 2MB/i);
  });

  test('returns 403 when import would exceed subscription limit', async () => {
    (utilsServer.getUserAndOrganizationInfo as jest.Mock).mockResolvedValue({ organization: { id: 'org1' } });
    (importUtils.checkRateLimit as jest.Mock).mockResolvedValue(true);
    (utilsServer.getSubscriptionLimit as jest.Mock).mockResolvedValue(10);
    (utilsServer.getReptileCount as jest.Mock).mockResolvedValue(9);
    // Mock Papa to produce 2 rows
    (PapaModule.parse as jest.Mock).mockImplementation(() => ({
      data: [
        { name: 'A', sex: 'male', species: 'S', acquisition_date: '2020-01-01' },
        { name: 'B', sex: 'female', species: 'S', acquisition_date: '2020-01-01' },
      ],
    }));
    const csv = 'name,sex,species,acquisition_date\nA,male,S,2020-01-01\nB,female,S,2020-01-01\n';
    const file = withText(new File([csv], 'test.csv', { type: 'text/csv' }), csv);
    const fd = new FormData();
    fd.append('file', file);
    const req = buildRequestWithFormData(fd);
    // @ts-expect-error minimal request
    await POST(req);
    const { body, init } = lastJsonCall();
    expect(init?.status).toBe(403);
    expect((body as { error: string }).error).toMatch(/exceed your subscription limit/i);
  });

  test('returns 200 with preview data for valid small CSV', async () => {
    (utilsServer.getUserAndOrganizationInfo as jest.Mock).mockResolvedValue({ organization: { id: 'org1' } });
    (importUtils.checkRateLimit as jest.Mock).mockResolvedValue(true);
    (utilsServer.getSubscriptionLimit as jest.Mock).mockResolvedValue(100);
    (utilsServer.getReptileCount as jest.Mock).mockResolvedValue(1);
    (importUtils.validateReptileRow as jest.Mock).mockReturnValue({ valid: true });
    // Two valid rows
    const rows = [
      { name: 'Alpha', sex: 'male', species: 'S1', acquisition_date: '2023-01-01' },
      { name: 'Beta', sex: 'female', species: 'S2', acquisition_date: '2023-02-02' },
    ];
    (PapaModule.parse as jest.Mock).mockImplementation(() => ({ data: rows }));
    const csv = 'name,sex,species,acquisition_date\nAlpha,male,S1,2023-01-01\nBeta,female,S2,2023-02-02\n';
    const file = withText(new File([csv], 'ok.csv', { type: 'text/csv' }), csv);
    const fd = new FormData();
    fd.append('file', file);
    const req = buildRequestWithFormData(fd);
    // @ts-expect-error minimal request
    await POST(req);
    const { body, init } = lastJsonCall();
    expect(init?.status).toBeUndefined(); // defaults to 200 in our mock
    const result = body as {
      headers: string[];
      totalRows: number;
      speciesCount: number;
      morphCount: number;
    };
    expect(result.totalRows).toBe(2);
    expect(Array.isArray(result.headers)).toBe(true);
    expect(result.speciesCount).toBe(2);
    expect(result.morphCount).toBe(0);
  });
});