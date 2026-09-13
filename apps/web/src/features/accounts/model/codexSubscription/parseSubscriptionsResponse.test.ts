import { describe, expect, it } from 'vitest';
import {
  parseSubscriptionsResponse,
  resolveSubscriptionUntilMs,
} from './parseSubscriptionsResponse';

const FETCHED_AT = 1_700_000_000_000;

describe('parseSubscriptionsResponse', () => {
  it('parses the ChatGPT subscriptions core fields', () => {
    const record = parseSubscriptionsResponse(
      {
        plan_type: 'plus',
        active_start: '2026-05-10T02:52:15Z',
        active_until: '2026-06-10T02:52:15Z',
        billing_period: 'monthly',
        will_renew: true,
        account_id: 'acc_123',
      },
      'acc_123',
      FETCHED_AT
    );

    expect(record).toMatchObject({
      accountId: 'acc_123',
      planType: 'plus',
      activeStartMs: Date.parse('2026-05-10T02:52:15Z'),
      activeUntilMs: Date.parse('2026-06-10T02:52:15Z'),
      billingPeriod: 'monthly',
      willRenew: true,
      fetchedAtMs: FETCHED_AT,
      source: 'subscriptions',
    });
    expect(resolveSubscriptionUntilMs(record)).toBe(Date.parse('2026-06-10T02:52:15Z'));
  });

  it('accepts camelCase aliases and nested subscription wrappers', () => {
    const record = parseSubscriptionsResponse(
      {
        subscription: {
          planType: 'pro',
          activeUntil: 1_788_220_799,
          willRenew: false,
        },
      },
      'acc_nested',
      FETCHED_AT
    );

    expect(record).toMatchObject({
      accountId: 'acc_nested',
      planType: 'pro',
      activeUntilMs: 1_788_220_799_000,
      willRenew: false,
    });
  });

  it('selects the matching account from an array payload', () => {
    const record = parseSubscriptionsResponse(
      [
        { account_id: 'other', plan_type: 'free', active_until: '2026-01-01T00:00:00Z' },
        { account_id: 'acc_match', plan_type: 'plus', active_until: '2026-08-01T00:00:00Z' },
      ],
      'acc_match',
      FETCHED_AT
    );

    expect(record?.accountId).toBe('acc_match');
    expect(record?.planType).toBe('plus');
    expect(record?.activeUntilMs).toBe(Date.parse('2026-08-01T00:00:00Z'));
  });

  it('returns null when a top-level object belongs to another account', () => {
    expect(
      parseSubscriptionsResponse(
        {
          account_id: 'acct_A',
          plan_type: 'plus',
          active_until: '2026-01-01T00:00:00Z',
        },
        'acct_B',
        FETCHED_AT
      )
    ).toBeNull();
  });

  it('returns null when a parent account_id mismatches a nested token-scoped object', () => {
    expect(
      parseSubscriptionsResponse(
        {
          account_id: 'OTHER',
          subscription: {
            plan_type: 'plus',
            active_until: '2099-01-01T00:00:00Z',
          },
        },
        'MINE',
        FETCHED_AT
      )
    ).toBeNull();
  });

  it('lets a nested object account_id MINE override a parent OTHER envelope', () => {
    const record = parseSubscriptionsResponse(
      {
        account_id: 'OTHER',
        subscription: {
          account_id: 'MINE',
          plan_type: 'plus',
          active_until: '2099-01-01T00:00:00Z',
        },
      },
      'MINE',
      FETCHED_AT
    );

    expect(record).toMatchObject({
      accountId: 'MINE',
      planType: 'plus',
      activeUntilMs: Date.parse('2099-01-01T00:00:00Z'),
    });
  });

  it('accepts a plural-key token-scoped object without a parent account id', () => {
    const record = parseSubscriptionsResponse(
      {
        subscriptions: {
          planType: 'pro',
          activeUntil: 1_788_220_799,
          willRenew: false,
        },
      },
      'acc_plural',
      FETCHED_AT
    );

    expect(record).toMatchObject({
      accountId: 'acc_plural',
      planType: 'pro',
      activeUntilMs: 1_788_220_799_000,
    });
  });

  it('returns null for a plural-key token-scoped object under a mismatched parent id', () => {
    expect(
      parseSubscriptionsResponse(
        {
          account_id: 'OTHER',
          subscriptions: {
            plan_type: 'plus',
            active_until: '2099-01-01T00:00:00Z',
          },
        },
        'MINE',
        FETCHED_AT
      )
    ).toBeNull();
  });

  it('prefers a matching subscriptions array over a dual-key token-scoped subscription object', () => {
    const record = parseSubscriptionsResponse(
      {
        subscription: {
          plan_type: 'team',
          active_until: '2026-01-01T00:00:00Z',
        },
        subscriptions: [
          { account_id: 'OTHER', plan_type: 'free', active_until: '2026-02-01T00:00:00Z' },
          { account_id: 'MINE', plan_type: 'plus', active_until: '2099-01-01T00:00:00Z' },
        ],
      },
      'MINE',
      FETCHED_AT
    );

    expect(record).toMatchObject({
      accountId: 'MINE',
      planType: 'plus',
      activeUntilMs: Date.parse('2099-01-01T00:00:00Z'),
    });
  });

  it('does not stamp a dual-key token-scoped subscription object when the array misses', () => {
    expect(
      parseSubscriptionsResponse(
        {
          subscription: {
            plan_type: 'plus',
            active_until: '2099-01-01T00:00:00Z',
          },
          subscriptions: [
            { account_id: 'OTHER', plan_type: 'pro', active_until: '2026-01-01T00:00:00Z' },
          ],
        },
        'MINE',
        FETCHED_AT
      )
    ).toBeNull();
  });

  it('still matches a nested array account under a different parent envelope id', () => {
    const record = parseSubscriptionsResponse(
      {
        account_id: 'OTHER',
        subscriptions: [
          { account_id: 'OTHER', plan_type: 'free', active_until: '2026-01-01T00:00:00Z' },
          { account_id: 'MINE', plan_type: 'plus', active_until: '2099-01-01T00:00:00Z' },
        ],
      },
      'MINE',
      FETCHED_AT
    );

    expect(record).toMatchObject({
      accountId: 'MINE',
      planType: 'plus',
      activeUntilMs: Date.parse('2099-01-01T00:00:00Z'),
    });
  });

  it('returns null when a nested object belongs to another account', () => {
    expect(
      parseSubscriptionsResponse(
        {
          subscription: {
            account_id: 'acct_A',
            plan_type: 'plus',
            active_until: '2026-01-01T00:00:00Z',
          },
        },
        'acct_B',
        FETCHED_AT
      )
    ).toBeNull();
  });

  it('returns null when a nested array misses the requested account', () => {
    expect(
      parseSubscriptionsResponse(
        {
          plan_type: 'plus',
          active_until: '2026-06-10T02:52:15Z',
          subscriptions: [
            { account_id: 'acct_A', plan_type: 'plus', active_until: '2026-01-01T00:00:00Z' },
            { account_id: 'acct_B', plan_type: 'pro', active_until: '2026-08-01T00:00:00Z' },
          ],
        },
        'acct_missing',
        FETCHED_AT
      )
    ).toBeNull();
  });

  it('returns null when the requested account is missing from an array payload', () => {
    const payload = [
      { account_id: 'acct_A', plan_type: 'plus', active_until: '2026-01-01T00:00:00Z' },
      { account_id: 'acct_B', plan_type: 'pro', active_until: '2026-08-01T00:00:00Z' },
    ];

    expect(parseSubscriptionsResponse(payload, 'acct_missing', FETCHED_AT)).toBeNull();
    expect(parseSubscriptionsResponse(payload, 'acct_C', FETCHED_AT)).toBeNull();
  });

  it('parses JSON string payloads like sister usage parsers', () => {
    const record = parseSubscriptionsResponse(
      JSON.stringify({
        plan_type: 'plus',
        active_until: '2026-06-10T02:52:15Z',
        account_id: 'acc_123',
      }),
      'acc_123',
      FETCHED_AT
    );

    expect(record).toMatchObject({
      accountId: 'acc_123',
      planType: 'plus',
      activeUntilMs: Date.parse('2026-06-10T02:52:15Z'),
    });
  });

  it('parses optional extras only when present', () => {
    const record = parseSubscriptionsResponse(
      {
        plan_type: 'team',
        seats_in_use: 2,
        seats_entitled: 5,
        is_delinquent: true,
        grace_period_end_timestamp: '2026-07-01T00:00:00Z',
        discount: { label: 'nonprofit' },
      },
      'acc_team',
      FETCHED_AT
    );

    expect(record?.extras).toEqual({
      seatsInUse: 2,
      seatsEntitled: 5,
      isDelinquent: true,
      gracePeriodEndMs: Date.parse('2026-07-01T00:00:00Z'),
      discountLabel: 'nonprofit',
    });
  });

  it('returns null for empty or unrelated payloads', () => {
    expect(parseSubscriptionsResponse({}, 'acc_123', FETCHED_AT)).toBeNull();
    expect(parseSubscriptionsResponse(null, 'acc_123', FETCHED_AT)).toBeNull();
    expect(parseSubscriptionsResponse({ error: 'nope' }, 'acc_123', FETCHED_AT)).toBeNull();
    expect(parseSubscriptionsResponse({ plan_type: 'plus' }, '', FETCHED_AT)).toBeNull();
  });
});
