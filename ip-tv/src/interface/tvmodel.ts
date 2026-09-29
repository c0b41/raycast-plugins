export type TvModel = {
  name: string
  tvg: {
    id: string
    name: string
    url: string
    logo: string
    rec: string
  }
  url: string
  group: { title: string }
  http: {
    referrer: string
    'user-agent': string
  }
  raw: string
  line: string
  catchup: {
    type: string
    source: string
    days: string
  }
  timeshift: string
}

export type TvModelFlag = {
  tvModel: TvModel
  title: string
  flag?: { name: string; emoji: string; image: string; code: string }
  resolution: string
}
