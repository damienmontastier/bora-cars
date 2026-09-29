export function validateHeroModules(modules: Array<{ _type: string }> | undefined): true | string {
  if (!modules?.length)
    return true
  const heroes = modules.filter(m => m._type === 'hero').length
  if (heroes > 1)
    return 'Un seul module Hero par page : remplacez les autres par un bloc « Média + texte ».'
  if (heroes === 1 && modules[0]._type !== 'hero')
    return 'Le module Hero doit toujours être en première position'
  return true
}
