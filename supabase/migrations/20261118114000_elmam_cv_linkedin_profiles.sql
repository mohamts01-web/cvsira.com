CREATE TABLE etmam.linkedin_profiles (
  draft_id uuid PRIMARY KEY REFERENCES etmam.drafts(id) ON DELETE CASCADE,
  sections jsonb NOT NULL CHECK (jsonb_typeof(sections) = 'object' AND octet_length(sections::text) <= 120000),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0)
);
ALTER TABLE etmam.linkedin_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON etmam.linkedin_profiles FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.etmam_linkedin_profile(p_actor uuid, p_draft uuid, p_sections jsonb DEFAULT NULL, p_revision integer DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE saved etmam.linkedin_profiles%ROWTYPE;
BEGIN
  IF p_draft IS NULL AND p_sections IS NULL THEN
    RETURN COALESCE((
      SELECT jsonb_agg(p.draft_id ORDER BY p.draft_id)
      FROM etmam.linkedin_profiles p JOIN etmam.drafts d ON d.id=p.draft_id
      WHERE d.account_id=p_actor
    ), '[]'::jsonb);
  END IF;
  IF p_sections IS NOT NULL THEN
    IF p_revision IS NULL OR p_revision < 0 THEN RAISE EXCEPTION 'invalid_profile_revision'; END IF;
    IF p_revision = 0 THEN
      INSERT INTO etmam.linkedin_profiles(draft_id,sections)
      SELECT id,p_sections FROM etmam.drafts WHERE id=p_draft AND account_id=p_actor
      ON CONFLICT (draft_id) DO NOTHING RETURNING * INTO saved;
    ELSE
      UPDATE etmam.linkedin_profiles p SET sections=p_sections,revision=p.revision+1
      FROM etmam.drafts d WHERE d.id=p_draft AND d.account_id=p_actor AND p.draft_id=d.id AND p.revision=p_revision
      RETURNING p.* INTO saved;
    END IF;
  ELSE
    SELECT p.* INTO saved FROM etmam.linkedin_profiles p JOIN etmam.drafts d ON d.id=p.draft_id
    WHERE d.id=p_draft AND d.account_id=p_actor;
  END IF;
  IF saved.draft_id IS NULL THEN RETURN NULL; END IF;
  RETURN jsonb_build_object('sections',saved.sections,'revision',saved.revision);
END;
$$;

REVOKE ALL ON FUNCTION public.etmam_linkedin_profile(uuid,uuid,jsonb,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etmam_linkedin_profile(uuid,uuid,jsonb,integer) TO service_role;
