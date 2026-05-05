import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const sanity = useSanity()

  try {
    const cars = await sanity.fetch<{ slug: string | null }[]>(
      `*[_type == "car"]{"slug": slug.current}`,
    )

    return cars
      .filter(car => car.slug)
      .map(({ slug }) => ({
        loc: `/car/${slug}`,
        _i18nTransform: true,
      }))
  }
  catch {
    return []
  }
})
