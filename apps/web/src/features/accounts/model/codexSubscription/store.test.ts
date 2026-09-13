import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CODEX_SUBSCRIPTIONS_URL } from '@/utils/quota/constants';
import { apiCallApi } from '@/services/api/apiCall';
import { CODEX_SUBSCRIPTION_RETRY_COOLDOWN_MS, CODEX_SUBSCRIPTION_TTL_MS } from './types';
import {
  ensureCodexSubscriptionFresh,
  getReadyCodexSubscriptionRecord,
  useCodexSubscriptionStore,
} from './store';

vi.mock('@/services/api/apiCall', () => ({
  apiCallApi: {
    request: vi.fn(),
  },
  getApiCallErrorMessage: (result: { statusCode?: number; bodyText?: string }) =>
    `${result.statusCode ?? 0} ${result.bodyText ?? 'failed'}`.trim(),
}));

const ACCOUNT_ID = 'acct_shared';
const NOW_MS = 1_700_000_000_000;

const successBody = {
  plan_type: 'plus',
  active_until: '2026-06-10T02:52:15Z',
  will_renew: true,
};

describe('codexSubscription store', () => {
  beforeEach(() => {
    useCodexSubscriptionStore.getState().clearForTests();
    vi.mocked(apiCallApi.request).mockReset();
  });

  afterEach(() => {
    useCodexSubscriptionStore.getState().clearForTests();
  });

  it('dedupes inflight ensureFresh calls for the same accountId', async () => {
    let release: (value: unknown) => void = () => undefined;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    vi.mocked(apiCallApi.request).mockImplementation(async () => {
      await pending;
      return {
        statusCode: 200,
        hasStatusCode: true,
        header: {},
        body: successBody,
        bodyText: JSON.stringify(successBody),
      };
    });

    const first = ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });
    const second = ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '2',
      nowMs: NOW_MS,
    });
    release(undefined);

    const [firstEntry, secondEntry] = await Promise.all([first, second]);
    expect(apiCallApi.request).toHaveBeenCalledTimes(1);
    expect(firstEntry).toEqual(secondEntry);
    expect(firstEntry.status).toBe('ready');
    expect(vi.mocked(apiCallApi.request).mock.calls[0]?.[0]).toMatchObject({
      authIndex: '1',
      method: 'GET',
      url: `${CODEX_SUBSCRIPTIONS_URL}?account_id=${ACCOUNT_ID}`,
    });
  });

  it('reuses a ready record inside the TTL', async () => {
    vi.mocked(apiCallApi.request).mockResolvedValue({
      statusCode: 200,
      hasStatusCode: true,
      header: {},
      body: successBody,
      bodyText: JSON.stringify(successBody),
    });

    await ensureCodexSubscriptionFresh({ accountId: ACCOUNT_ID, authIndex: '1', nowMs: NOW_MS });
    await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS + CODEX_SUBSCRIPTION_TTL_MS - 1,
    });

    expect(apiCallApi.request).toHaveBeenCalledTimes(1);
  });

  it('marks soft_failed after a ready fetch fails and does not keep the prior record', async () => {
    vi.mocked(apiCallApi.request)
      .mockResolvedValueOnce({
        statusCode: 200,
        hasStatusCode: true,
        header: {},
        body: successBody,
        bodyText: JSON.stringify(successBody),
      })
      .mockResolvedValueOnce({
        statusCode: 401,
        hasStatusCode: true,
        header: {},
        body: { error: 'Unauthorized' },
        bodyText: 'Unauthorized',
      });

    const ready = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });
    const afterFail = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS + CODEX_SUBSCRIPTION_TTL_MS + 1,
    });

    expect(apiCallApi.request).toHaveBeenCalledTimes(2);
    expect(ready.status).toBe('ready');
    expect(afterFail).toMatchObject({
      status: 'soft_failed',
      accountId: ACCOUNT_ID,
      failedAtMs: NOW_MS + CODEX_SUBSCRIPTION_TTL_MS + 1,
      lastAttemptAtMs: NOW_MS + CODEX_SUBSCRIPTION_TTL_MS + 1,
      lastAuthIndex: '1',
      triedAuthIndexes: ['1'],
      errorKind: 'http',
    });
    expect(useCodexSubscriptionStore.getState().getEntry(ACCOUNT_ID).status).toBe('soft_failed');
    expect(getReadyCodexSubscriptionRecord(ACCOUNT_ID)).toBeNull();
  });

  it('honors cooldown for bare soft_failed and post-ready failure retries', async () => {
    vi.mocked(apiCallApi.request)
      .mockResolvedValueOnce({
        statusCode: 500,
        hasStatusCode: true,
        header: {},
        body: {},
        bodyText: 'boom',
      })
      .mockResolvedValueOnce({
        statusCode: 200,
        hasStatusCode: true,
        header: {},
        body: successBody,
        bodyText: JSON.stringify(successBody),
      })
      .mockResolvedValueOnce({
        statusCode: 401,
        hasStatusCode: true,
        header: {},
        body: { error: 'Unauthorized' },
        bodyText: 'Unauthorized',
      });

    const failedAt = NOW_MS;
    const bareFail = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: failedAt,
    });
    const duringBareCooldown = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: failedAt + CODEX_SUBSCRIPTION_RETRY_COOLDOWN_MS - 1,
    });

    expect(bareFail.status).toBe('soft_failed');
    expect(duringBareCooldown).toEqual(bareFail);
    expect(apiCallApi.request).toHaveBeenCalledTimes(1);

    const recoveredAt = failedAt + CODEX_SUBSCRIPTION_RETRY_COOLDOWN_MS;
    const ready = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: recoveredAt,
    });
    expect(ready.status).toBe('ready');
    expect(apiCallApi.request).toHaveBeenCalledTimes(2);

    const postReadyFailAt = recoveredAt + CODEX_SUBSCRIPTION_TTL_MS + 1;
    const postReadyFail = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: postReadyFailAt,
    });
    const duringPostReadyCooldown = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: postReadyFailAt + CODEX_SUBSCRIPTION_RETRY_COOLDOWN_MS - 1,
    });

    expect(postReadyFail.status).toBe('soft_failed');
    expect(duringPostReadyCooldown).toEqual(postReadyFail);
    expect(getReadyCodexSubscriptionRecord(ACCOUNT_ID)).toBeNull();
    expect(apiCallApi.request).toHaveBeenCalledTimes(3);
  });

  it('rotates to a sibling authIndex after an http soft-fail for the same accountId', async () => {
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
        body: successBody,
        bodyText: JSON.stringify(successBody),
      });

    const first = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });
    const second = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '2',
      nowMs: NOW_MS,
    });

    expect(first).toMatchObject({
      status: 'soft_failed',
      lastAuthIndex: '1',
      triedAuthIndexes: ['1'],
      errorKind: 'http',
    });
    expect(second.status).toBe('ready');
    expect(apiCallApi.request).toHaveBeenCalledTimes(2);
    expect(vi.mocked(apiCallApi.request).mock.calls[0]?.[0]).toMatchObject({ authIndex: '1' });
    expect(vi.mocked(apiCallApi.request).mock.calls[1]?.[0]).toMatchObject({ authIndex: '2' });
  });

  it('does not ping-pong already-tried authIndexes during cooldown', async () => {
    vi.mocked(apiCallApi.request).mockResolvedValue({
      statusCode: 401,
      hasStatusCode: true,
      header: {},
      body: { error: 'Unauthorized' },
      bodyText: 'Unauthorized',
    });

    await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });
    await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '2',
      nowMs: NOW_MS,
    });
    await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });

    expect(apiCallApi.request).toHaveBeenCalledTimes(2);
    expect(useCodexSubscriptionStore.getState().getEntry(ACCOUNT_ID)).toMatchObject({
      status: 'soft_failed',
      lastAuthIndex: '2',
      triedAuthIndexes: ['1', '2'],
    });
  });

  it('does not coalesce force:true into a non-force inflight', async () => {
    let release: (value: unknown) => void = () => undefined;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    vi.mocked(apiCallApi.request)
      .mockImplementationOnce(async () => {
        await pending;
        return {
          statusCode: 200,
          hasStatusCode: true,
          header: {},
          body: successBody,
          bodyText: JSON.stringify(successBody),
        };
      })
      .mockResolvedValueOnce({
        statusCode: 200,
        hasStatusCode: true,
        header: {},
        body: { ...successBody, plan_type: 'pro' },
        bodyText: JSON.stringify({ ...successBody, plan_type: 'pro' }),
      });

    const first = ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });
    const forced = ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
      force: true,
    });
    release(undefined);

    const [firstEntry, forcedEntry] = await Promise.all([first, forced]);
    expect(apiCallApi.request).toHaveBeenCalledTimes(2);
    expect(firstEntry.status).toBe('ready');
    expect(forcedEntry.status).toBe('ready');
    if (forcedEntry.status === 'ready') {
      expect(forcedEntry.record.planType).toBe('pro');
    }
  });

  it('keeps a fresh ready record when a chained force soft-fails', async () => {
    let release: (value: unknown) => void = () => undefined;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    vi.mocked(apiCallApi.request)
      .mockImplementationOnce(async () => {
        await pending;
        return {
          statusCode: 200,
          hasStatusCode: true,
          header: {},
          body: successBody,
          bodyText: JSON.stringify(successBody),
        };
      })
      .mockResolvedValueOnce({
        statusCode: 401,
        hasStatusCode: true,
        header: {},
        body: { error: 'Unauthorized' },
        bodyText: 'Unauthorized',
      });

    const first = ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });
    const forced = ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
      force: true,
    });
    release(undefined);

    const [firstEntry, forcedEntry] = await Promise.all([first, forced]);
    expect(apiCallApi.request).toHaveBeenCalledTimes(2);
    expect(firstEntry.status).toBe('ready');
    expect(forcedEntry.status).toBe('ready');
    expect(useCodexSubscriptionStore.getState().getEntry(ACCOUNT_ID).status).toBe('ready');
    expect(getReadyCodexSubscriptionRecord(ACCOUNT_ID)?.planType).toBe('plus');
  });

  it('stores soft_failed when there is no prior ready record', async () => {
    vi.mocked(apiCallApi.request).mockResolvedValue({
      statusCode: 500,
      hasStatusCode: true,
      header: {},
      body: {},
      bodyText: 'boom',
    });

    const entry = await ensureCodexSubscriptionFresh({
      accountId: ACCOUNT_ID,
      authIndex: '1',
      nowMs: NOW_MS,
    });

    expect(entry).toMatchObject({
      status: 'soft_failed',
      accountId: ACCOUNT_ID,
      failedAtMs: NOW_MS,
      lastAttemptAtMs: NOW_MS,
      lastAuthIndex: '1',
      triedAuthIndexes: ['1'],
      errorKind: 'http',
    });
    expect(getReadyCodexSubscriptionRecord(ACCOUNT_ID)).toBeNull();
  });
});
