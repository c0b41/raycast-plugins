export type CaseType = "lower" | "upper" | "sentence" | "capitalized" | "alternating" | "title" | "inverse";

const getLocale = (input: string) => {
  const turkishChars = /[İıĞğÜüŞşÖöÇç]/;
  return turkishChars.test(input) ? "tr-TR" : "en-US";
};

export const applyCaseConversion = (input: string, type: CaseType): string => {
  if (!input.trim()) return input;
  const locale = getLocale(input);
  const smallWords = ["a", "an", "the", "and", "or", "but", "in", "on", "of", "with", "at", "by", "for"];

  switch (type) {
    case "lower":
      return input.toLocaleLowerCase(locale);

    case "upper":
      return input.toLocaleUpperCase(locale);

    case "sentence":
      return input
        .split("\n")
        .map((para) =>
          para
            .split(". ")
            .map((sent) => sent.charAt(0).toLocaleUpperCase(locale) + sent.slice(1).toLocaleLowerCase(locale))
            .join(". "),
        )
        .join("\n");

    case "capitalized":
      return input
        .split(" ")
        .map((w) => w.charAt(0).toLocaleUpperCase(locale) + w.slice(1).toLocaleLowerCase(locale))
        .join(" ");

    case "alternating":
      return input
        .split("")
        .map((c, i) => (i % 2 === 0 ? c.toLocaleUpperCase(locale) : c.toLocaleLowerCase(locale)))
        .join("");

    case "inverse":
      return input
        .split("")
        .map((c) => (c === c.toLocaleUpperCase(locale) ? c.toLocaleLowerCase(locale) : c.toLocaleUpperCase(locale)))
        .join("");

    case "title":
      return input
        .split("\n")
        .map((para) => {
          const words = para.split(" ");
          return words
            .map((word, i) => {
              const lower = word.toLocaleLowerCase(locale);
              if (i === 0 || i === words.length - 1 || !smallWords.includes(lower)) {
                return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1).toLocaleLowerCase(locale);
              }
              return lower;
            })
            .join(" ");
        })
        .join("\n");

    default:
      return input;
  }
};
