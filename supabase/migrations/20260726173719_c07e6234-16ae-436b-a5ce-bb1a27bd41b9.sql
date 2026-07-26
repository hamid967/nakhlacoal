-- Add ZATCA CSR configuration fields to credentials
ALTER TABLE public.zatca_credentials
  ADD COLUMN IF NOT EXISTS csr_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS public_key text,
  ADD COLUMN IF NOT EXISTS key_curve text NOT NULL DEFAULT 'secp256k1';

COMMENT ON COLUMN public.zatca_credentials.csr_config IS
  'ZATCA CSR fields: { invoice_type: "1100"|"0100"|"1000"|"0110", solution_name, industry, common_name_suffix, egs_serial }';
COMMENT ON COLUMN public.zatca_credentials.public_key IS 'Base64 SEC1 uncompressed EC point (0x04||X||Y)';
COMMENT ON COLUMN public.zatca_credentials.key_curve IS 'ZATCA mandates secp256k1';