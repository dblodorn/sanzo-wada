// Absolute URLs baked in at build time use the deployment's own origin. This
// mirrors Next's metadataBase fallback, made explicit: production domain, then
// preview, then local.
export const siteOrigin = () => {
  const { VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_BRANCH_URL, VERCEL_URL } =
    process.env
  if (VERCEL_ENV === 'production' && VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${VERCEL_PROJECT_PRODUCTION_URL}`
  const preview = VERCEL_BRANCH_URL ?? VERCEL_URL
  if (preview) return `https://${preview}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}
