CREATE TABLE etmam.application_tracker (
  account_id uuid NOT NULL REFERENCES etmam.accounts(id) ON DELETE CASCADE,
  job_id bigint NOT NULL CHECK (job_id BETWEEN 1 AND 999999999999),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  company text CHECK (char_length(company) <= 300),
  stage text NOT NULL CHECK (stage IN ('saved','applied','interview','closed')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, job_id)
);

ALTER TABLE etmam.application_tracker ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON etmam.application_tracker FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.etmam_application_tracker(p_actor uuid, p_action text, p_entry jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF p_action = 'upsert' THEN
    INSERT INTO etmam.application_tracker(account_id, job_id, title, company, stage)
    VALUES (p_actor, (p_entry->>'id')::bigint, p_entry->>'title', p_entry->>'company', p_entry->>'stage')
    ON CONFLICT (account_id,job_id) DO UPDATE
      SET title = excluded.title, company = excluded.company, stage = excluded.stage, updated_at = now();
  ELSIF p_action = 'remove' THEN
    DELETE FROM etmam.application_tracker WHERE account_id = p_actor AND job_id = (p_entry->>'id')::bigint;
  ELSIF p_action <> 'list' THEN
    RAISE EXCEPTION 'invalid_tracker_action';
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object('id',job_id,'title',title,'company',company,'stage',stage)
      ORDER BY updated_at DESC,job_id DESC)
    FROM etmam.application_tracker WHERE account_id = p_actor
  ), '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.etmam_application_tracker(uuid,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etmam_application_tracker(uuid,text,jsonb) TO service_role;
