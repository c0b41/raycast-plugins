type GetNewsArgs = {
  league: string;
};

const getNews = async ({ league }: GetNewsArgs): Promise<any[]> => {
  const baseUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/${league}/news`;

  const res = await fetch(baseUrl);
  const body = (await res.json()) as { articles: any[] };

  return body.articles;
};

export default getNews;
