const toText = (value) => {
  if (Array.isArray(value)) return value.join(" ");
  return value || "";
};

const GENRE_RULES = [
  { genre: "Chemistry", words: ["chemistry", "chemical", "molecule"] },
  {
    genre: "Physics",
    words: [
      "physics",
      "relativity",
      "quantum",
      "mechanics",
      "einstein",
      "thermodynamics",
      "astronomy",
    ],
  },
  {
    genre: "Mathematics",
    words: ["mathematics", "math", "algebra", "geometry", "calculus"],
  },
  {
    genre: "Science Fiction",
    words: ["science fiction", "sci-fi", "space fiction"],
  },
  { genre: "Science", words: ["science", "biology", "botany", "zoology"] },
  { genre: "Fantasy", words: ["fantasy", "magic", "myth"] },
  { genre: "Adventure", words: ["adventure", "journey", "exploration"] },
  { genre: "Mystery", words: ["mystery", "detective", "crime", "suspense"] },
  { genre: "Romance", words: ["romance", "love", "courtship"] },
  { genre: "History", words: ["history", "historical", "civilization"] },
  { genre: "Biography", words: ["biography", "autobiography", "memoir"] },
  { genre: "Religion", words: ["religion", "christian", "islam", "bible"] },
  { genre: "Art", words: ["art", "painting", "music", "design"] },
  { genre: "Business", words: ["business", "economics", "finance"] },
  { genre: "Poetry", words: ["poetry", "poem", "poems"] },
  { genre: "Children", words: ["children", "juvenile", "picture book"] },
  { genre: "Horror", words: ["horror", "ghost", "supernatural"] },
  { genre: "Dystopia", words: ["dystopia", "dystopian"] },
  { genre: "Philosophy", words: ["philosophy", "ethics", "logic"] },
  { genre: "Classic", words: ["classic", "literature"] },
  { genre: "Nonfiction", words: ["essay", "education", "reference"] },
];

const RELATED_GENRES = {
  Chemistry: ["Science"],
  Physics: ["Science"],
  Mathematics: ["Science"],
  Biography: ["Nonfiction"],
  History: ["Nonfiction"],
  Business: ["Nonfiction"],
  Art: ["Nonfiction"],
  Religion: ["Nonfiction"],
  Philosophy: ["Nonfiction"],
  Dystopia: ["Fiction"],
  Fantasy: ["Fiction"],
  Mystery: ["Fiction"],
  Romance: ["Fiction"],
  Horror: ["Fiction"],
  Adventure: ["Fiction"],
  "Science Fiction": ["Fiction", "Science"],
};

const buildSearchText = (book) =>
  [
    book.title,
    book.subtitle,
    toText(book.author_name),
    toText(book.subject),
    toText(book.subject_facet),
    toText(book.person),
    toText(book.place),
    toText(book.time),
    book.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const getBookGenres = (book) => {
  const searchableText = buildSearchText(book);

  const matchedGenres = GENRE_RULES.filter((rule) =>
    rule.words.some((word) => searchableText.includes(word)),
  ).map((rule) => rule.genre);

  const primaryGenres = matchedGenres.length > 0 ? matchedGenres : ["Fiction"];
  const relatedGenres = primaryGenres.flatMap(
    (genre) => RELATED_GENRES[genre] || [],
  );

  return [...new Set([...primaryGenres, ...relatedGenres])].slice(0, 4);
};
