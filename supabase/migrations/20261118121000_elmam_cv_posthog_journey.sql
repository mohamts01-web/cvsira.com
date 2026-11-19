ALTER TABLE etmam.whop_intents ADD COLUMN posthog_journey_id uuid;

CREATE FUNCTION public.etmam_whop_attribute_journey(p_actor uuid, p_intent uuid, p_journey uuid)
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  UPDATE etmam.whop_intents SET posthog_journey_id = p_journey
  WHERE account_id = p_actor AND id = p_intent AND environment = 'live'
    AND posthog_journey_id IS NULL AND configuration_id IS NULL AND payment_id IS NULL;
$$;
REVOKE ALL ON FUNCTION public.etmam_whop_attribute_journey(uuid,uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etmam_whop_attribute_journey(uuid,uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION etmam.export_confirmed_purchases() RETURNS integer
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  ids uuid[];
  batch jsonb;
  response extensions.http_response;
BEGIN
  IF NOT pg_catalog.pg_try_advisory_xact_lock(1475719,384900) THEN RETURN 0; END IF;
  SELECT array_agg(intent.id), jsonb_agg(jsonb_build_object(
    'event','cv purchase confirmed',
    'uuid',md5('elmam-cv-posthog-purchase-v1:' || intent.id::text)::uuid,
    'distinct_id',COALESCE(intent.posthog_journey_id::text,md5('elmam-cv-posthog-purchase-v1:' || intent.id::text)),
    'timestamp',intent.paid_at,
    'properties',jsonb_strip_nulls(jsonb_build_object('site','elmam_cv','source','whop_verified',
      'job_id',intent.referral_job_id,'$process_person_profile',false,'$geoip_disable',true))
  )) INTO ids,batch
  FROM (
    SELECT i.id,i.paid_at,i.posthog_journey_id,i.referral_job_id
    FROM etmam.whop_intents i
    WHERE i.environment='live' AND i.payment_id IS NOT NULL AND i.paid_at IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM etmam.posthog_purchase_exports e WHERE e.intent_id=i.id)
    ORDER BY i.paid_at,i.id LIMIT 100
  ) intent;
  IF ids IS NULL THEN RETURN 0; END IF;

  PERFORM extensions.http_set_curlopt('CURLOPT_CONNECTTIMEOUT_MS','2000');
  PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','8000');
  SELECT * INTO response FROM extensions.http_post('https://us.i.posthog.com/batch/',
    jsonb_build_object('api_key','phc_n2Y5DSoHZSUjZHGvUGczSmyyphtYcysWwrruTvSrzfJS','batch',batch)::text,
    'application/json');
  IF response.status NOT BETWEEN 200 AND 299
    OR (response.content::jsonb->>'status') IS DISTINCT FROM '1'
    OR (response.content::jsonb ? 'quota_limited')
  THEN RAISE EXCEPTION 'posthog_purchase_export_not_accepted (%)', response.status; END IF;
  INSERT INTO etmam.posthog_purchase_exports(intent_id) SELECT unnest(ids) ON CONFLICT DO NOTHING;
  RETURN cardinality(ids);
END;
$$;
REVOKE ALL ON FUNCTION etmam.export_confirmed_purchases() FROM PUBLIC, anon, authenticated;
