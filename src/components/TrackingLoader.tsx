import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Dynamically injects GA4 (gtag.js) and/or GTM scripts based on admin settings.
// Reads public row from public.analytics_settings. Safe no-op when disabled or empty.

const GA4_RE = /^G-[A-Z0-9]{6,}$/;
const GTM_RE = /^GTM-[A-Z0-9]{4,}$/;

function injectGtm(containerId: string) {
  if (document.getElementById('lov-gtm-script')) return;
  const s = document.createElement('script');
  s.id = 'lov-gtm-script';
  s.async = true;
  s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`;
  document.head.appendChild(s);

  const ns = document.createElement('noscript');
  ns.id = 'lov-gtm-noscript';
  ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.appendChild(ns);
}

function injectGa4(measurementId: string) {
  if (document.getElementById('lov-ga4-script')) return;
  const tag = document.createElement('script');
  tag.id = 'lov-ga4-script';
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(tag);

  const inline = document.createElement('script');
  inline.id = 'lov-ga4-inline';
  inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}');`;
  document.head.appendChild(inline);
}

export default function TrackingLoader() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('analytics_settings')
          .select('ga4_measurement_id, gtm_container_id, enabled')
          .eq('id', true)
          .maybeSingle();
        if (cancelled || !data || !data.enabled) return;

        if (data.gtm_container_id && GTM_RE.test(data.gtm_container_id)) {
          injectGtm(data.gtm_container_id);
        }
        if (data.ga4_measurement_id && GA4_RE.test(data.ga4_measurement_id)) {
          injectGa4(data.ga4_measurement_id);
        }
      } catch {
        /* fail closed — tracking is non-critical */
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return null;
}
