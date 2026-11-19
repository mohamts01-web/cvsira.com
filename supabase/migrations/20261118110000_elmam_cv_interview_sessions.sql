CREATE TABLE etmam.interview_sessions (
  account_id uuid NOT NULL REFERENCES etmam.accounts (id) ON DELETE CASCADE,
  job_id bigint NOT NULL CHECK (job_id BETWEEN 0 AND 999999999999),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND octet_length(payload::text) <= 60000),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, job_id)
);

ALTER TABLE etmam.interview_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON etmam.interview_sessions FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.etmam_interview_sessions(
  p_actor uuid, p_job bigint DEFAULT NULL, p_payload jsonb DEFAULT NULL, p_revision integer DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE saved etmam.interview_sessions%ROWTYPE;
BEGIN
  IF p_payload IS NOT NULL THEN
    IF p_job IS NULL OR p_revision IS NULL OR p_revision < 0 THEN
      RAISE EXCEPTION 'invalid_interview_session';
    END IF;
    IF p_revision = 0 THEN
      INSERT INTO etmam.interview_sessions (account_id, job_id, payload)
      VALUES (p_actor, p_job, p_payload)
      ON CONFLICT (account_id, job_id) DO NOTHING
      RETURNING * INTO saved;
    ELSE
      UPDATE etmam.interview_sessions
      SET payload = p_payload, revision = revision + 1, updated_at = now()
      WHERE account_id = p_actor AND job_id = p_job AND revision = p_revision
      RETURNING * INTO saved;
    END IF;
    IF saved.account_id IS NULL THEN RETURN NULL; END IF;
    RETURN saved.payload || jsonb_build_object('revision', saved.revision, 'updated', saved.updated_at);
  END IF;
  IF p_job IS NOT NULL THEN
    SELECT * INTO saved FROM etmam.interview_sessions WHERE account_id = p_actor AND job_id = p_job;
    IF saved.account_id IS NULL THEN RETURN NULL; END IF;
    RETURN saved.payload || jsonb_build_object('revision', saved.revision, 'updated', saved.updated_at);
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(payload || jsonb_build_object('revision', revision, 'updated', updated_at) ORDER BY updated_at DESC)
    FROM (
      SELECT payload, revision, updated_at FROM etmam.interview_sessions
      WHERE account_id = p_actor ORDER BY updated_at DESC LIMIT 100
    ) latest
  ), '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.etmam_interview_sessions(uuid,bigint,jsonb,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etmam_interview_sessions(uuid,bigint,jsonb,integer) TO service_role;
