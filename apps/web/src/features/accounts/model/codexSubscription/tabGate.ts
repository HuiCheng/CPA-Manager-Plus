import type { CodexQuotaState } from '@/types';
import type { AccountRow } from '@/features/accounts/model/accountRows';
import { buildAccountSubscriptionPresentation } from '@/features/accounts/model/accountSubscriptionPresentation';
import { normalizeAuthIndex } from '@/utils/quota/parsers';
import { resolveCodexChatgptAccountId } from '@/utils/quota/resolvers';
import { ensureCodexSubscriptionFresh, getCodexSubscriptionEntry } from './store';
import type { CodexSubscriptionEntry } from './types';

export const shouldShowCodexSubscriptionTab = (
  row: Pick<AccountRow, 'provider' | 'planType' | 'raw'>,
  codexQuota?: CodexQuotaState | null
): boolean => buildAccountSubscriptionPresentation({ row, codexQuota }).isPaidCodex;

const canRotateFailedAuthIndex = (errorKind: string): boolean =>
  errorKind === 'http' || errorKind === 'network';

const pickAuthIndexForAccount = (accountId: string, authIndexes: string[]): string => {
  const entry = getCodexSubscriptionEntry(accountId);
  if (
    entry.status === 'soft_failed' &&
    canRotateFailedAuthIndex(entry.errorKind) &&
    entry.lastAuthIndex
  ) {
    const rotated = authIndexes.find((index) => index !== entry.lastAuthIndex);
    if (rotated) return rotated;
  }
  return authIndexes[0] ?? '';
};

export const collectCodexSubscriptionTargets = (
  rows: Array<Pick<AccountRow, 'provider' | 'planType' | 'raw' | 'authIndex'>>,
  resolveQuota?: (
    row: Pick<AccountRow, 'provider' | 'planType' | 'raw'>
  ) => CodexQuotaState | null | undefined
): Array<{ accountId: string; authIndex: string }> => {
  const candidates = new Map<string, string[]>();
  for (const row of rows) {
    if (!shouldShowCodexSubscriptionTab(row, resolveQuota?.(row))) continue;
    const accountId = resolveCodexChatgptAccountId(row.raw);
    const authIndex = normalizeAuthIndex(row.authIndex ?? row.raw.auth_index ?? row.raw.authIndex);
    if (!accountId || !authIndex) continue;
    const existing = candidates.get(accountId) ?? [];
    if (!existing.includes(authIndex)) existing.push(authIndex);
    candidates.set(accountId, existing);
  }
  return [...candidates.entries()].map(([accountId, authIndexes]) => ({
    accountId,
    authIndex: pickAuthIndexForAccount(accountId, authIndexes),
  }));
};

export const resolveCodexSubscriptionRefreshAuthIndex = (
  accountId: string,
  selectedAuthIndex: string,
  siblingAuthIndexes: string[]
): string => {
  const selected = normalizeAuthIndex(selectedAuthIndex);
  if (!selected) return siblingAuthIndexes.find(Boolean) ?? '';
  const entry = getCodexSubscriptionEntry(accountId);
  if (
    entry.status === 'soft_failed' &&
    canRotateFailedAuthIndex(entry.errorKind) &&
    entry.lastAuthIndex === selected
  ) {
    const rotated = siblingAuthIndexes.find((index) => index !== entry.lastAuthIndex);
    if (rotated) return rotated;
  }
  return selected;
};

export const ensureCodexSubscriptionTargetsFresh = (
  rows: Array<Pick<AccountRow, 'provider' | 'planType' | 'raw' | 'authIndex'>>,
  resolveQuota?: (
    row: Pick<AccountRow, 'provider' | 'planType' | 'raw'>
  ) => CodexQuotaState | null | undefined,
  input?: { nowMs?: number; force?: boolean }
): Promise<CodexSubscriptionEntry>[] => {
  const targets = collectCodexSubscriptionTargets(rows, resolveQuota);
  return targets.map((target) => ensureCodexSubscriptionFresh({ ...target, ...input }));
};
