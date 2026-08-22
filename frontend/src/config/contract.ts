// Mirrors the deployed contract's actual public methods and return
// shapes exactly — see contracts/retractionwatch.py. Never invent a
// field here that the contract doesn't actually return.

export type IdentifierKind = 'doi' | 'arxiv';

export type Verdict =
  | 'confirmed_active'
  | 'confirmed_retracted'
  | 'no_record_found'
  | 'sources_conflict'
  | '';

export type AssertedStatus = 'active' | 'retracted_or_withdrawn';

export type AssertionAccuracy = 'true' | 'false' | 'unverifiable' | '';

export type CheckStatus = 'filed' | 'resolved';

export interface PaperRecordView {
  paper_id: string;
  identifier_kind: IdentifierKind;
  registrant: string;
  registered_at: number;
  check_count: number;
}

export interface CheckRecordView {
  check_id: number;
  paper_id: string;
  filer: string;
  asserted_status: AssertedStatus;
  status: CheckStatus;
  verdict: Verdict;
  confidence_bps: number;
  reasoning_summary: string;
  assertion_accurate: AssertionAccuracy;
}

export const VERDICT_LABELS: Record<Exclude<Verdict, ''>, string> = {
  confirmed_active: 'Confirmed Active',
  confirmed_retracted: 'Confirmed Retracted',
  no_record_found: 'No Record Found',
  sources_conflict: 'Sources Conflict',
};

export const ASSERTED_STATUS_LABELS: Record<AssertedStatus, string> = {
  active: 'Active / not retracted',
  retracted_or_withdrawn: 'Retracted or withdrawn',
};
