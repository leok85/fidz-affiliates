import { useQuery } from '@tanstack/react-query';
import { fetchAffiliateAccess, fetchBalance, fetchLedger, fetchReferrals, fetchRejectedInvoice } from './api';
import { pointsFromCommissions } from './rules';

export const useAffiliateAccess = (enabled = true) => useQuery({ queryKey: ['profile'], queryFn: fetchAffiliateAccess, enabled });

/** Only rendered inside the shell, which waits for an active affiliate. */
export function useProfile() {
  const query = useAffiliateAccess();
  return { ...query, data: query.data?.status === 'active' ? query.data.profile : undefined };
}
export const useBalance = () => useQuery({ queryKey: ['balance'], queryFn: fetchBalance });
export const useLedger = () => useQuery({ queryKey: ['ledger'], queryFn: fetchLedger });
export const useReferrals = () => useQuery({ queryKey: ['referrals'], queryFn: fetchReferrals });
export const useRejectedInvoice = () => useQuery({ queryKey: ['rejected-invoice'], queryFn: fetchRejectedInvoice });

/** Points only count commissions already out of grace (available + withdrawn). */
export function usePoints() {
  const { data } = useBalance();
  return data ? pointsFromCommissions(data.available + data.withdrawn) : undefined;
}
