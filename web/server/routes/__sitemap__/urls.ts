export default defineEventHandler(async () => {
  const projectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production'

  if (!projectId) return []

  const query = `*[_type == "car"]{"slug": slug.current}`
  const url = `https://${projectId}.api.sanity.io/v2026-04-06/data/query/${dataset}?query=${encodeURIComponent(query)}`

  try {
    const { result } = await $fetch<{ result: { slug: string | null }[] }>(url)

    return result
      .filter(car => car.slug)
      .flatMap(({ slug }) => [
        { loc: `/fr/car/${slug}` },
        { loc: `/en/car/${slug}` },
      ])
  }
  catch {
    return []
  }
})
