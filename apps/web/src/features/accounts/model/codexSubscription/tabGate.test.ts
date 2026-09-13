import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AccountRow } from '@/features/accounts/model/accountRows';
import { apiCallApi } from '@/services/api/apiCall';
import {
  collectCodexSubscriptionTargets,
  ensureCodexSubscriptionTargetsFresh,
  resolveCodexSubscriptionRefreshAuthIndex,
  shouldShowCodexSubscriptionTab,
} from './tabGate';
import { useCodexSubscriptionStore } from './store';

vi.mock('@/services/api/apiCall', () => ({
  apiCallApi: {
    request: vi.fn(),
  },
  getApiCallErrorMessage: (result: { statusCode?: number; bodyText?: string }) =>
    `${result.statusCode ?? 0} ${result.bodyText ?? 'failed'}`.trim(),
}));

const makeRow = (overrides: Partial<AccountRow> = {}): AccountRow =>
  ({
    key: 'row-1',
    selectionKey: 'row-1',
    fileName: 'codex-plus.json',
    provider: 'codex',
    accountLabel: 'plus@example.com',
    planType: 'plus',
    authIndex: 'codex-1',
    raw: {
      name: 'codex-plus.json',
      type: 'codex',
      chatgpt_account_id: 'acct_plus',
      authIndex: 'codex-1',
    },
    ...overrides,
  }) as AccountRow;

describe('shouldShowCodexSubscriptionTab', () => {
  it('shows the tab only for paid Codex', () => {
    expect(shouldShowCodexSubscriptionTab(makeRow())).toBe(true);
    expect(shouldShowCodexSubscriptionTab(makeRow({ planType: 'pro' }))).toBe(true);
    expect(shouldShowCodexSubscriptionTab(makeRow({ planType: 'free' }))).toBe(false);
    expect(shouldShowCodexSubscriptionTab(makeRow({ provider: 'claude', planType: 'pro' }))).toBe(
      false
    );
  });
});

describe('collectCodexSubscriptionTargets', () => {
  beforeEach(() => {
    useCodexSubscriptionStore.getState().clearForTests();
    vi.mocked(apiCallApi.request).mockReset();
  });

  afterEach(() => {
    useCodexSubscriptionStore.getState().clearForTests();
  });

  it('shares one target per chatgpt_account_id across credential files', () => {
    const shared = makeRow({
      key: 'a',
      selectionKey: 'a',
      fileName: 'a.json',
      authIndex: '1',
      raw: { name: 'a.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '1' },
    });
    const duplicate = makeRow({
      key: 'b',
      selectionKey: 'b',
      fileName: 'b.json',
      authIndex: '2',
      raw: { name: 'b.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '2' },
    });
    const other = makeRow({
      key: 'c',
      selectionKey: 'c',
      fileName: 'c.json',
      authIndex: '3',
      planType: 'team',
      raw: { name: 'c.json', type: 'codex', chatgpt_account_id: 'acct_other', authIndex: '3' },
    });
    const free = makeRow({
      key: 'd',
      selectionKey: 'd',
      planType: 'free',
      raw: { name: 'free.json', type: 'codex', chatgpt_account_id: 'acct_free', authIndex: '4' },
    });

    expect(collectCodexSubscriptionTargets([shared, duplicate, other, free])).toEqual([
      { accountId: 'acct_shared', authIndex: '1' },
      { accountId: 'acct_other', authIndex: '3' },
    ]);
  });

  it('rotates to a sibling authIndex after http/network soft-fail for the same accountId', () => {
    const shared = makeRow({
      key: 'a',
      selectionKey: 'a',
      fileName: 'a.json',
      authIndex: '1',
      raw: { name: 'a.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '1' },
    });
    const sibling = makeRow({
      key: 'b',
      selectionKey: 'b',
      fileName: 'b.json',
      authIndex: '2',
      raw: { name: 'b.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '2' },
    });

    useCodexSubscriptionStore.setState({
      entries: {
        acct_shared: {
          status: 'soft_failed',
          accountId: 'acct_shared',
          failedAtMs: 1_700_000_000_000,
          lastAttemptAtMs: 1_700_000_000_000,
          lastAuthIndex: '1',
          triedAuthIndexes: ['1'],
          errorKind: 'http',
        },
      },
    });

    expect(collectCodexSubscriptionTargets([shared, sibling])).toEqual([
      { accountId: 'acct_shared', authIndex: '2' },
    ]);
  });

  it('does not rotate after a non-http/network soft-fail', () => {
    const shared = makeRow({
      key: 'a',
      selectionKey: 'a',
      fileName: 'a.json',
      authIndex: '1',
      raw: { name: 'a.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '1' },
    });
    const sibling = makeRow({
      key: 'b',
      selectionKey: 'b',
      fileName: 'b.json',
      authIndex: '2',
      raw: { name: 'b.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '2' },
    });

    useCodexSubscriptionStore.setState({
      entries: {
        acct_shared: {
          status: 'soft_failed',
          accountId: 'acct_shared',
          failedAtMs: 1_700_000_000_000,
          lastAttemptAtMs: 1_700_000_000_000,
          lastAuthIndex: '1',
          triedAuthIndexes: ['1'],
          errorKind: 'invalid_payload',
        },
      },
    });

    expect(collectCodexSubscriptionTargets([shared, sibling])).toEqual([
      { accountId: 'acct_shared', authIndex: '1' },
    ]);
  });

  it('re-runs target ensure after soft_failed entries change so sibling authIndex is scheduled', async () => {
    const shared = makeRow({
      key: 'a',
      selectionKey: 'a',
      fileName: 'a.json',
      authIndex: '1',
      raw: { name: 'a.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '1' },
    });
    const sibling = makeRow({
      key: 'b',
      selectionKey: 'b',
      fileName: 'b.json',
      authIndex: '2',
      raw: { name: 'b.json', type: 'codex', chatgpt_account_id: 'acct_shared', authIndex: '2' },
    });

    vi.mocked(apiCallApi.request)
      .mockResolvedValueOnce({
        statusCode: 401,
        hasStatusCode: true,
        header: {},
        body: { error: 'Unauthorized' },
        bodyText: 'Unauthorized',
      })
      .mockResolvedValueOnce({
        statusCode: 200,
        hasStatusCode: true,
        header: {},
        body: {
          plan_type: 'plus',
          active_until: '2026-06-10T02:52:15Z',
        },
        bodyText: '{"plan_type":"plus"}',
      });

    await Promise.all(ensureCodexSubscriptionTargetsFresh([shared, sibling]));
    expect(vi.mocked(apiCallApi.request).mock.calls[0]?.[0]).toMatchObject({ authIndex: '1' });
    expect(useCodexSubscriptionStore.getState().getEntry('acct_shared').status).toBe('soft_failed');

    await Promise.all(ensureCodexSubscriptionTargetsFresh([shared, sibling]));
    expect(apiCallApi.request).toHaveBeenCalledTimes(2);
    expect(vi.mocked(apiCallApi.request).mock.calls[1]?.[0]).toMatchObject({ authIndex: '2' });
    expect(useCodexSubscriptionStore.getState().getEntry('acct_shared').status).toBe('ready');
  });
});

describe('resolveCodexSubscriptionRefreshAuthIndex', () => {
  beforeEach(() => {
    useCodexSubscriptionStore.getState().clearForTests();
  });

  afterEach(() => {
    useCodexSubscriptionStore.getState().clearForTests();
  });

  it('prefers a rotated sibling when the selected credential soft-failed', () => {
    useCodexSubscriptionStore.setState({
      entries: {
        acct_shared: {
          status: 'soft_failed',
          accountId: 'acct_shared',
          failedAtMs: 1,
          lastAttemptAtMs: 1,
          lastAuthIndex: '1',
          triedAuthIndexes: ['1'],
          errorKind: 'http',
        },
      },
    });

    expect(resolveCodexSubscriptionRefreshAuthIndex('acct_shared', '1', ['1', '2'])).toBe('2');
  });

  it('keeps the selected authIndex when it is not the failed credential', () => {
    useCodexSubscriptionStore.setState({
      entries: {
        acct_shared: {
          status: 'soft_failed',
          accountId: 'acct_shared',
          failedAtMs: 1,
          lastAttemptAtMs: 1,
          lastAuthIndex: '1',
          triedAuthIndexes: ['1'],
          errorKind: 'http',
        },
      },
    });

    expect(resolveCodexSubscriptionRefreshAuthIndex('acct_shared', '2', ['1', '2'])).toBe('2');
  });
});
