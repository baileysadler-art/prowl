-- ============================================================================
-- PriceHawk Initial Schema Migration
-- ============================================================================
-- Creates all core tables, indexes, RLS policies, and trigger functions.
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at column on row modification.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function that returns the organization_id for the currently
-- authenticated Supabase user. Used by RLS policies.
CREATE OR REPLACE FUNCTION auth.user_org_id()
RETURNS uuid AS $$
  SELECT organization_id
  FROM public.users
  WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- organizations
-- --------------------------------------------------------------------------
CREATE TABLE public.organizations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        UNIQUE NOT NULL,
  stripe_customer_id text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- users
-- --------------------------------------------------------------------------
CREATE TABLE public.users (
  id              uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  organization_id uuid        NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  email           text        NOT NULL,
  full_name       text        NOT NULL,
  role            text        NOT NULL DEFAULT 'owner'
                              CHECK (role IN ('owner', 'admin', 'member')),
  avatar_url      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- subscriptions
-- --------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        uuid        UNIQUE REFERENCES public.organizations ON DELETE CASCADE,
  stripe_subscription_id text,
  plan_tier              text        NOT NULL DEFAULT 'starter'
                                     CHECK (plan_tier IN ('starter', 'professional', 'business', 'enterprise')),
  status                 text        NOT NULL DEFAULT 'trialing'
                                     CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'inactive')),
  competitor_limit       int         NOT NULL DEFAULT 3,
  scrape_interval_hours  int         NOT NULL DEFAULT 12,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- competitors
-- --------------------------------------------------------------------------
CREATE TABLE public.competitors (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid        NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  name             text        NOT NULL,
  website_url      text        NOT NULL,
  logo_url         text,
  status           text        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'paused', 'error')),
  scrape_frequency text        NOT NULL DEFAULT 'every_12h',
  last_scraped_at  timestamptz,
  product_count    int         NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- competitor_pages
-- --------------------------------------------------------------------------
CREATE TABLE public.competitor_pages (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid        NOT NULL REFERENCES public.competitors ON DELETE CASCADE,
  url           text        NOT NULL,
  page_type     text        NOT NULL DEFAULT 'collection'
                            CHECK (page_type IN ('collection', 'product', 'category', 'search')),
  label         text,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- products
-- --------------------------------------------------------------------------
CREATE TABLE public.products (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id   uuid          NOT NULL REFERENCES public.competitors ON DELETE CASCADE,
  name            text          NOT NULL,
  url             text          NOT NULL,
  image_url       text,
  current_price   numeric(10,2),
  original_price  numeric(10,2),
  currency        text          NOT NULL DEFAULT 'GBP',
  in_stock        boolean       NOT NULL DEFAULT true,
  is_on_sale      boolean       NOT NULL DEFAULT false,
  category        text,
  sku             text,
  last_checked_at timestamptz,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- price_history
-- --------------------------------------------------------------------------
CREATE TABLE public.price_history (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid          NOT NULL REFERENCES public.products ON DELETE CASCADE,
  price          numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  currency       text          NOT NULL DEFAULT 'GBP',
  recorded_at    timestamptz   NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- product_changes
-- --------------------------------------------------------------------------
CREATE TABLE public.product_changes (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid          NOT NULL REFERENCES public.products ON DELETE CASCADE,
  change_type       text          NOT NULL
                                  CHECK (change_type IN (
                                    'price_increase', 'price_decrease', 'new_product',
                                    'out_of_stock', 'back_in_stock', 'sale_started', 'sale_ended'
                                  )),
  old_value         text,
  new_value         text,
  percentage_change numeric(5,2),
  detected_at       timestamptz   NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- scrape_jobs
-- --------------------------------------------------------------------------
CREATE TABLE public.scrape_jobs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id    uuid        NOT NULL REFERENCES public.competitors ON DELETE CASCADE,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  pages_scraped    int         NOT NULL DEFAULT 0,
  products_found   int         NOT NULL DEFAULT 0,
  changes_detected int         NOT NULL DEFAULT 0,
  error_message    text,
  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- alert_configs
-- --------------------------------------------------------------------------
CREATE TABLE public.alert_configs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  name            text        NOT NULL,
  alert_type      text        NOT NULL
                              CHECK (alert_type IN (
                                'price_increase', 'price_decrease', 'new_product',
                                'out_of_stock', 'back_in_stock', 'sale_started',
                                'sale_ended', 'any_change'
                              )),
  threshold       numeric(5,2),
  competitor_id   uuid        REFERENCES public.competitors ON DELETE SET NULL,
  channels        text[]      NOT NULL DEFAULT '{email}',
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- alerts
-- --------------------------------------------------------------------------
CREATE TABLE public.alerts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  alert_config_id uuid        REFERENCES public.alert_configs ON DELETE SET NULL,
  product_id      uuid        REFERENCES public.products ON DELETE SET NULL,
  competitor_id   uuid        REFERENCES public.competitors ON DELETE SET NULL,
  title           text        NOT NULL,
  message         text        NOT NULL,
  severity        text        NOT NULL DEFAULT 'info'
                              CHECK (severity IN ('info', 'warning', 'critical')),
  change_type     text,
  is_read         boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- notification_settings
-- --------------------------------------------------------------------------
CREATE TABLE public.notification_settings (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid        UNIQUE NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  email_enabled     boolean     NOT NULL DEFAULT true,
  email_frequency   text        NOT NULL DEFAULT 'instant'
                                CHECK (email_frequency IN ('instant', 'hourly', 'daily', 'weekly')),
  slack_enabled     boolean     NOT NULL DEFAULT false,
  slack_webhook_url text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- reports
-- --------------------------------------------------------------------------
CREATE TABLE public.reports (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  title           text        NOT NULL,
  report_type     text        NOT NULL DEFAULT 'weekly'
                              CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  period_start    date        NOT NULL,
  period_end      date        NOT NULL,
  summary         jsonb,
  status          text        NOT NULL DEFAULT 'generating'
                              CHECK (status IN ('generating', 'ready', 'failed')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX idx_competitors_organization_id    ON public.competitors (organization_id);
CREATE INDEX idx_products_competitor_id          ON public.products (competitor_id);
CREATE INDEX idx_price_history_product_recorded  ON public.price_history (product_id, recorded_at);
CREATE INDEX idx_product_changes_product_detected ON public.product_changes (product_id, detected_at);
CREATE INDEX idx_alerts_org_is_read              ON public.alerts (organization_id, is_read);

-- ============================================================================
-- 4. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_competitors
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_alert_configs
  BEFORE UPDATE ON public.alert_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_notification_settings
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.organizations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_pages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_changes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_jobs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports               ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- organizations policies
-- --------------------------------------------------------------------------
CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT USING (id = auth.user_org_id());

CREATE POLICY "organizations_insert" ON public.organizations
  FOR INSERT WITH CHECK (id = auth.user_org_id());

CREATE POLICY "organizations_update" ON public.organizations
  FOR UPDATE USING (id = auth.user_org_id());

CREATE POLICY "organizations_delete" ON public.organizations
  FOR DELETE USING (id = auth.user_org_id());

-- --------------------------------------------------------------------------
-- users policies
-- --------------------------------------------------------------------------
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (organization_id = auth.user_org_id());

CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (organization_id = auth.user_org_id());

CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (organization_id = auth.user_org_id());

-- --------------------------------------------------------------------------
-- subscriptions policies
-- --------------------------------------------------------------------------
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (organization_id = auth.user_org_id());

CREATE POLICY "subscriptions_insert" ON public.subscriptions
  FOR INSERT WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "subscriptions_update" ON public.subscriptions
  FOR UPDATE USING (organization_id = auth.user_org_id());

CREATE POLICY "subscriptions_delete" ON public.subscriptions
  FOR DELETE USING (organization_id = auth.user_org_id());

-- --------------------------------------------------------------------------
-- competitors policies
-- --------------------------------------------------------------------------
CREATE POLICY "competitors_select" ON public.competitors
  FOR SELECT USING (organization_id = auth.user_org_id());

CREATE POLICY "competitors_insert" ON public.competitors
  FOR INSERT WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "competitors_update" ON public.competitors
  FOR UPDATE USING (organization_id = auth.user_org_id());

CREATE POLICY "competitors_delete" ON public.competitors
  FOR DELETE USING (organization_id = auth.user_org_id());

-- --------------------------------------------------------------------------
-- competitor_pages policies (join through competitors to get org)
-- --------------------------------------------------------------------------
CREATE POLICY "competitor_pages_select" ON public.competitor_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = competitor_pages.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "competitor_pages_insert" ON public.competitor_pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = competitor_pages.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "competitor_pages_update" ON public.competitor_pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = competitor_pages.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "competitor_pages_delete" ON public.competitor_pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = competitor_pages.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

-- --------------------------------------------------------------------------
-- products policies (join through competitors to get org)
-- --------------------------------------------------------------------------
CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = products.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "products_insert" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = products.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "products_update" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = products.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "products_delete" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = products.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

-- --------------------------------------------------------------------------
-- price_history policies (join through products -> competitors to get org)
-- --------------------------------------------------------------------------
CREATE POLICY "price_history_select" ON public.price_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = price_history.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "price_history_insert" ON public.price_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = price_history.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "price_history_update" ON public.price_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = price_history.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "price_history_delete" ON public.price_history
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = price_history.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

-- --------------------------------------------------------------------------
-- product_changes policies (join through products -> competitors to get org)
-- --------------------------------------------------------------------------
CREATE POLICY "product_changes_select" ON public.product_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = product_changes.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "product_changes_insert" ON public.product_changes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = product_changes.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "product_changes_update" ON public.product_changes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = product_changes.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "product_changes_delete" ON public.product_changes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.competitors ON competitors.id = products.competitor_id
      WHERE products.id = product_changes.product_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

-- --------------------------------------------------------------------------
-- scrape_jobs policies (join through competitors to get org)
-- --------------------------------------------------------------------------
CREATE POLICY "scrape_jobs_select" ON public.scrape_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = scrape_jobs.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "scrape_jobs_insert" ON public.scrape_jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = scrape_jobs.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "scrape_jobs_update" ON public.scrape_jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = scrape_jobs.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

CREATE POLICY "scrape_jobs_delete" ON public.scrape_jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.competitors
      WHERE competitors.id = scrape_jobs.competitor_id
        AND competitors.organization_id = auth.user_org_id()
    )
  );

-- --------------------------------------------------------------------------
-- alert_configs policies
-- --------------------------------------------------------------------------
CREATE POLICY "alert_configs_select" ON public.alert_configs
  FOR SELECT USING (organization_id = auth.user_org_id());

CREATE POLICY "alert_configs_insert" ON public.alert_configs
  FOR INSERT WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "alert_configs_update" ON public.alert_configs
  FOR UPDATE USING (organization_id = auth.user_org_id());

CREATE POLICY "alert_configs_delete" ON public.alert_configs
  FOR DELETE USING (organization_id = auth.user_org_id());

-- --------------------------------------------------------------------------
-- alerts policies
-- --------------------------------------------------------------------------
CREATE POLICY "alerts_select" ON public.alerts
  FOR SELECT USING (organization_id = auth.user_org_id());

CREATE POLICY "alerts_insert" ON public.alerts
  FOR INSERT WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "alerts_update" ON public.alerts
  FOR UPDATE USING (organization_id = auth.user_org_id());

CREATE POLICY "alerts_delete" ON public.alerts
  FOR DELETE USING (organization_id = auth.user_org_id());

-- --------------------------------------------------------------------------
-- notification_settings policies
-- --------------------------------------------------------------------------
CREATE POLICY "notification_settings_select" ON public.notification_settings
  FOR SELECT USING (organization_id = auth.user_org_id());

CREATE POLICY "notification_settings_insert" ON public.notification_settings
  FOR INSERT WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "notification_settings_update" ON public.notification_settings
  FOR UPDATE USING (organization_id = auth.user_org_id());

CREATE POLICY "notification_settings_delete" ON public.notification_settings
  FOR DELETE USING (organization_id = auth.user_org_id());

-- --------------------------------------------------------------------------
-- reports policies
-- --------------------------------------------------------------------------
CREATE POLICY "reports_select" ON public.reports
  FOR SELECT USING (organization_id = auth.user_org_id());

CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "reports_update" ON public.reports
  FOR UPDATE USING (organization_id = auth.user_org_id());

CREATE POLICY "reports_delete" ON public.reports
  FOR DELETE USING (organization_id = auth.user_org_id());
