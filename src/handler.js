const uniqid = require('uniqid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // validasi
  const errors = [];
  let strMohon = '';
  if (name === undefined) { strMohon = ' Mohon'; errors.push(' isi nama buku'); }
  if (year === undefined) { strMohon = ' Mohon'; errors.push(' isi tahun buku'); }
  if (author === undefined) { strMohon = ' Mohon'; errors.push(' isi author buku'); }
  if (summary === undefined) { strMohon = ' Mohon'; errors.push(' isi kesimpulan buku'); }
  if (publisher === undefined) { strMohon = ' Mohon'; errors.push(' isi publisher buku'); }
  if (pageCount === undefined) { strMohon = ' Mohon'; errors.push(' isi pageCount buku'); }
  if (readPage === undefined) { strMohon = ' Mohon'; errors.push(' isi RpadPage buku'); }
  if (reading === undefined) { strMohon = ' Mohon'; errors.push(' isi reading buku'); }
  if (typeof reading !== 'boolean') errors.push(' tipe data reading harus boolean');
  if (typeof readPage !== 'number') errors.push(' tipe data readPage harus number');
  if (typeof pageCount !== 'number') errors.push(' tipe data pageCount harus number');
  if (typeof year !== 'number') errors.push(' tipe data year harus number');
  if (readPage > pageCount) errors.push(' readPage tidak boleh lebih besar dari pageCount');

  if (errors.length) {
    const errorMesssage = errors.toString();
    const response = h.response({
      status: 'fail',
      message: `Gagal menambahkan buku.${strMohon}${errorMesssage}`,
    });
    response.code(400);
    return response;
  }

  // menyiapkan data untuk di simpan
  const id = uniqid();
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    finished: pageCount === readPage,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBookHandler = (request, h) => {
  // ambil query dari parameter
  const { query } = request;
  const name = query.name ?? false;
  const finished = query.finished ?? false;
  const reading = query.reading ?? false;
  const finishedBool = finished === '1';
  const readingBool = reading === '1';

  const isSearch = name || finishedBool || readingBool;

  const booksFilter = books.filter((e) => {
    const getNameResult = name ? String(e.name)
      .toLocaleLowerCase()
      .includes(String(name).toLocaleLowerCase()) : true;
    const finishedResult = finished ? e.finished === finishedBool : true;
    const readingResult = reading ? e.reading === readingBool : true;
    return getNameResult && finishedResult && readingResult;
  }).map((e) => ({
    id: e.id,
    name: e.name,
    publisher: e.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: booksFilter,
    },
  });

  let code = 200;
  // jika menggunakan fitur pencarian dan hasilnya kosong maka set status code 404
  if (isSearch) code = booksFilter.length ? 200 : 404;
  response.code(code);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = books.filter((data) => data.id === id);

  if (book.length > 0) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditemukan',
      data: {
        book: book[0],
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // validasi
  const errors = [];
  let strMohon = '';
  if (name === undefined) { strMohon = ' Mohon'; errors.push(' isi nama buku'); }
  if (year === undefined) { strMohon = ' Mohon'; errors.push(' isi tahun buku'); }
  if (author === undefined) { strMohon = ' Mohon'; errors.push(' isi author buku'); }
  if (summary === undefined) { strMohon = ' Mohon'; errors.push(' isi kesimpulan buku'); }
  if (publisher === undefined) { strMohon = ' Mohon'; errors.push(' isi publisher buku'); }
  if (pageCount === undefined) { strMohon = ' Mohon'; errors.push(' isi pageCount buku'); }
  if (readPage === undefined) { strMohon = ' Mohon'; errors.push(' isi RpadPage buku'); }
  if (reading === undefined) { strMohon = ' Mohon'; errors.push(' isi reading buku'); }
  if (typeof reading !== 'boolean') errors.push(' tipe data reading harus boolean');
  if (typeof readPage !== 'number') errors.push(' tipe data readPage harus number');
  if (typeof pageCount !== 'number') errors.push(' tipe data pageCount harus number');
  if (typeof year !== 'number') errors.push(' tipe data year harus number');
  if (readPage > pageCount) errors.push(' readPage tidak boleh lebih besar dari pageCount');

  if (errors.length) {
    const errorMesssage = errors.toString();
    const response = h.response({
      status: 'fail',
      message: `Gagal memperbarui buku.${strMohon}${errorMesssage}`,
    });
    response.code(400);
    return response;
  }

  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished: pageCount === readPage,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBookHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
