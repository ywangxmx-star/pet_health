const SPECIES_AVATAR = {
  猫: '/static/avatar/cat.png',
  cat: '/static/avatar/cat.png',
  狗: '/static/avatar/dog.png',
  dog: '/static/avatar/dog.png',
  犬: '/static/avatar/dog.png',
  兔: '/static/cover/rabbit.png',
  仓鼠: '/static/cover/hamster.png',
  龙猫: '/static/cover/hamster.png',
  鸟: '/static/cover/bird.png',
  鱼: '/static/cover/fish.png',
  龟: '/static/cover/reptile.png',
  蜥蜴: '/static/cover/reptile.png',
  蛇: '/static/cover/reptile.png'
}

const SPECIES_COVER = {
  cat: '/static/cover/cat.png',
  dog: '/static/cover/dog.png',
  rabbit: '/static/cover/rabbit.png',
  hamster: '/static/cover/hamster.png',
  bird: '/static/cover/bird.png',
  fish: '/static/cover/fish.png',
  reptile: '/static/cover/reptile.png',
  猫: '/static/cover/cat.png',
  狗: '/static/cover/dog.png',
  兔: '/static/cover/rabbit.png',
  仓鼠: '/static/cover/hamster.png',
  鸟: '/static/cover/bird.png',
  鱼: '/static/cover/fish.png',
  爬宠: '/static/cover/reptile.png'
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8080'

export function petAvatar(species) {
  return SPECIES_AVATAR[species] || '/static/avatar/pet.png'
}

export function articleCover(aOrTag) {
  if (aOrTag && typeof aOrTag === 'object') {
    const u = aOrTag.coverUrl
    if (u) {
      if (/^https?:\/\//i.test(u)) return u
      return API_BASE + u
    }
    return articleCover(aOrTag.speciesTag)
  }
  if (!aOrTag) return '/static/cover/pet.png'
  const k = String(aOrTag).toLowerCase()
  return SPECIES_COVER[aOrTag] || SPECIES_COVER[k] || '/static/cover/pet.png'
}

export function userAvatar(url) {
  if (url && /^https?:\/\//i.test(url)) return url
  if (url && url.startsWith('/')) return API_BASE + url
  return '/static/avatar/user.png'
}
