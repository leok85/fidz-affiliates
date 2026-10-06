import { useQuery } from '@tanstack/react-query';
import { fetchBalance, fetchLedger, fetchProfile, fetchReferrals, fetchRejectedInvoice } from './api';
import { pointsFromCommissions } from './rules';

export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
export const useBalance = () => useQuery({ queryKey: ['balance'], queryFn: fetchBalance });
export const useLedger = () => useQuery({ queryKey: ['ledger'], queryFn: fetchLedger });
export const useReferrals = () => useQuery({ queryKey: ['referrals'], queryFn: fetchReferrals });
export const useRejectedInvoice = () => useQuery({ queryKey: ['rejected-invoice'], queryFn: fetchRejectedInvoice });

/** Points only count commissions already out of grace (available + withdrawn). */
export function usePoints() {
  const { data } = useBalance();
  return data ? pointsFromCommissions(data.available + data.withdrawn) : undefined;
}
