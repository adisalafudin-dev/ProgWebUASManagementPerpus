import { getBookGenres } from "./genreMapper";

const uniqueText = (values, limit = 3) =>
  [
    ...new Set(
      (Array.isArray(values) ? values : [values])
        .map((value) => value?.trim())
        .filter(Boolean),
    ),
  ].slice(0, limit);

const getFirstSentence = (book) => {
  const sentence = Array.isArray(book.first_sentence)
    ? book.first_sentence[0]
    : book.first_sentence;

  return typeof sentence === "string"
    ? sentence.replace(/\s+/g, " ").trim()
    : "";
};

export const formatOpenLibraryBook = (book, index) => {
  // Keep enough Open Library subjects for the dynamic category aggregation.
  const subjects = uniqueText(
    [...(book.subject || []), ...(book.subject_facet || [])],
    12,
  );
  const authors = uniqueText(book.author_name, 20);
  const publishers = uniqueText(book.publisher, 20);
  const languages = uniqueText(book.language, 20);
  const genres = getBookGenres(book);
  const title = book.title || "Judul tidak tersedia";
  const cover = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : book.cover_edition_key
      ? `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`
      : "";

  return {
    // This shape is deliberately independent from the Open Library response,
    // so a NestJS response can use the same contract later.
    id:
      book.key ||
      book.cover_edition_key ||
      `${title}-${book.first_publish_year || index}`,
    key: book.key || "",
    workKey: book.key || "",
    title,
    author: authors.slice(0, 5).join(", ") || "Penulis tidak diketahui",
    authors,
    year: book.first_publish_year || "-",
    publisher: publishers.slice(0, 2).join(", ") || null,
    publishers,
    isbn: book.isbn?.[0] || null,
    subjects,
    genre: genres[0] || "Umum",
    genres,
    tags: subjects.filter((subject) => !genres.includes(subject)).slice(0, 3),
    languages: languages.slice(0, 4),
    allLanguages: languages,
    editionCount: Number(book.edition_count) || 0,
    rating: Number(book.ratings_average) || 0,
    available: ["public", "borrowable"].includes(book.ebook_access),
    featured: false,
    cover,
    pages: book.number_of_pages_median || book.edition_count || null,
    synopsis: getFirstSentence(book),
  };
};

export const formatBackendBook = (book) => {
  const category = book.category?.name || null;

  return {
    id: book.id,
    key: book.id,
    workKey: book.id,
    title: book.title || "Judul tidak tersedia",
    author: book.author || "Penulis tidak diketahui",
    authors: book.author ? [book.author] : [],
    year: book.publishedYear || "-",
    publisher: book.publisher || null,
    publishers: book.publisher ? [book.publisher] : [],
    isbn: book.isbn || null,
    subjects: category ? [category] : [],
    genre: category || "Umum",
    genres: category ? [category] : [],
    tags: [],
    languages: [],
    allLanguages: [],
    editionCount: 0,
    rating: 0, // masih 0 — belum diagregasi dari modul review
    available: (book.stock ?? 0) > 0,
    featured: false,
    cover: book.cover || "",
    pages: book.pages || null,
    synopsis: book.synopsis || "",
    stock: book.stock ?? 0,
  };
};
