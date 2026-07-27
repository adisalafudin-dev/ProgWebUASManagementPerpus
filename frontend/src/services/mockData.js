// Mock data untuk menggantikan backend API

const MOCK_USERS = [
  {
    id: "user-1",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "ADMIN",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
  },
  {
    id: "user-2",
    email: "user@example.com",
    password: "user123",
    name: "Regular User",
    role: "USER",
    avatar: "https://ui-avatars.com/api/?name=Regular+User&background=6366f1&color=fff",
  },
];

const MOCK_TOKENS = {
  "user-1": {
    accessToken: "mock-access-token-admin",
    refreshToken: "mock-refresh-token-admin",
    expiresIn: 3600,
  },
  "user-2": {
    accessToken: "mock-access-token-user",
    refreshToken: "mock-refresh-token-user",
    expiresIn: 3600,
  },
};

let currentSession = null;

export const mockAuth = {
  login: async (credentials) => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    
    const user = MOCK_USERS.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error("Email atau password salah");
    }

    const tokens = MOCK_TOKENS[user.id];
    currentSession = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };

    return currentSession;
  },

  register: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const existingUser = MOCK_USERS.find((u) => u.email === payload.email);
    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: payload.email,
      password: payload.password,
      name: payload.name || payload.email.split("@")[0],
      role: "USER",
      avatar: `https://ui-avatars.com/api/?name=${payload.name || "User"}&background=6366f1&color=fff`,
    };

    MOCK_USERS.push(newUser);
    MOCK_TOKENS[newUser.id] = {
      accessToken: `mock-access-token-${newUser.id}`,
      refreshToken: `mock-refresh-token-${newUser.id}`,
      expiresIn: 3600,
    };

    const tokens = MOCK_TOKENS[newUser.id];
    currentSession = {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
      },
      ...tokens,
    };

    return currentSession;
  },

  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    currentSession = null;
    return { message: "Logout berhasil" };
  },

  refreshToken: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!currentSession) {
      throw new Error("Sesi tidak valid");
    }

    return {
      accessToken: `mock-refreshed-access-token-${Date.now()}`,
      refreshToken: `mock-refreshed-refresh-token-${Date.now()}`,
      expiresIn: 3600,
    };
  },

  getProfile: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!currentSession) {
      throw new Error("Sesi tidak valid");
    }

    return currentSession.user;
  },

  updateProfile: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (!currentSession) {
      throw new Error("Sesi tidak valid");
    }

    currentSession.user = {
      ...currentSession.user,
      ...payload,
    };

    return currentSession.user;
  },

  changePassword: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (!currentSession) {
      throw new Error("Sesi tidak valid");
    }

    return { message: "Password berhasil diubah" };
  },
};

export const mockBooks = {
  getBooks: async (params) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const { FALLBACK_BOOKS } = await import("../constants/books.js");
    let books = [...FALLBACK_BOOKS];

    // Filter by genre
    if (params?.genre && params.genre !== "Semua") {
      books = books.filter((book) => book.genre === params.genre);
    }

    // Search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (params?.sort) {
      switch (params.sort) {
        case "title-asc":
          books.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "title-desc":
          books.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "year-desc":
          books.sort((a, b) => b.year - a.year);
          break;
        case "year-asc":
          books.sort((a, b) => a.year - b.year);
          break;
        case "rating-desc":
          books.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    return {
      data: books,
      total: books.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  },

  getBookById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const { FALLBACK_BOOKS } = await import("../constants/books.js");
    const book = FALLBACK_BOOKS.find((b) => b.id === id);

    if (!book) {
      throw new Error("Buku tidak ditemukan");
    }

    return book;
  },

  createBook: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newBook = {
      id: `book-${Date.now()}`,
      key: `book-${Date.now()}`,
      ...payload,
      rating: payload.rating || 4.0,
    };

    return newBook;
  },

  updateBook: async (id, payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return { id, ...payload };
  },

  deleteBook: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return { message: "Buku berhasil dihapus" };
  },

  searchBooks: async (params) => {
    return mockBooks.getBooks(params);
  },
};

export const mockFavorites = {
  getFavorites: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return [];
  },

  addFavorite: async (bookId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return { bookId, message: "Buku ditambahkan ke favorit" };
  },

  removeFavorite: async (bookId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return { bookId, message: "Buku dihapus dari favorit" };
  },
};

export const mockReviews = {
  getReviews: async (bookId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return [];
  },

  createReview: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return { ...payload, id: `review-${Date.now()}` };
  },
};

export const mockCategories = {
  getCategories: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const { GENRES } = await import("../constants/books.js");
    return GENRES.filter((g) => g !== "Semua").map((name, index) => ({
      id: `cat-${index}`,
      name,
    }));
  },
};

export const mockNotifications = {
  getNotifications: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return [];
  },

  markAsRead: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return { id, read: true };
  },
};

export const mockUsers = {
  getUsers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return MOCK_USERS.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
    }));
  },

  updateUser: async (id, payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return { id, ...payload };
  },
};
