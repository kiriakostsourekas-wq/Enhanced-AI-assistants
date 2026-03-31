create table if not exists antigravity_campaign_runs (
  run_id uuid primary key,
  campaign_id text not null,
  idempotency_key text not null unique,
  status text not null,
  current_stage text null,
  scheduled_for timestamptz not null,
  started_at timestamptz not null,
  completed_at timestamptz null,
  config_json jsonb not null,
  summary_json jsonb not null default '{}'::jsonb
);

create index if not exists antigravity_campaign_runs_campaign_idx
  on antigravity_campaign_runs (campaign_id, status);

create table if not exists antigravity_prospect_runs (
  run_id uuid not null references antigravity_campaign_runs(run_id) on delete cascade,
  campaign_id text not null,
  prospect_id text not null,
  status text not null,
  current_stage text null,
  blocking_reason text null,
  state_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (run_id, prospect_id)
);

create index if not exists antigravity_prospect_runs_status_idx
  on antigravity_prospect_runs (run_id, status);

create table if not exists antigravity_stage_attempts (
  attempt_id uuid primary key,
  run_id uuid not null references antigravity_campaign_runs(run_id) on delete cascade,
  prospect_id text null,
  stage_name text not null,
  status text not null,
  attempt_number integer not null,
  idempotency_key text not null,
  input_json jsonb null,
  output_json jsonb null,
  error_message text null,
  started_at timestamptz not null,
  finished_at timestamptz null
);

create index if not exists antigravity_stage_attempts_run_stage_idx
  on antigravity_stage_attempts (run_id, prospect_id, stage_name, attempt_number);

comment on table antigravity_campaign_runs is
  'One scheduled orchestration run per campaign config and schedule bucket.';

comment on table antigravity_prospect_runs is
  'Per-prospect state snapshots so runs can resume and audits stay localized.';

comment on table antigravity_stage_attempts is
  'Every stage attempt, including retries, with JSON payloads for provenance and debugging.';
