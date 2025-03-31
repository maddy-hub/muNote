import PouchDB from "pouchdb";

let db = new PouchDB("muNoteDB");

export const addBook = async (book) => {
  try {
    const response = await db.put({
      _id: book,
      name: book,
      note: [],
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addNote = async (id, note) => {
  try {
    const docById = await db.get(id);
    let noteInPut;
    if (!docById.note.includes(note)) {
      noteInPut = docById.note.push(note);
      const updatedDoc = { ...docById, ...noteInPut };
      const response = await db.put(updatedDoc);
      return response;
    } else {
      const doc = await db.get(id);
      return doc;
    }

  } catch (error) {
    if (error.status === 404) {
      const response = await db.put({
        _id: id,
        name: id,
        note: [note],
      });
      return response;
      // console.error('⚠️ Document not found:', id);
    } else {
      console.error("❌ Error updating document:", error);
    }
    throw error;
  }
};

export const showAllBook = async () => {
  try {
    const result = await db.allDocs({
      include_docs: true,
    });
    return result.rows.map((row) => row.doc);
  } catch (error) {
    throw error;
  }
};

export const getBook = async (book) => {
  try {
    const doc = await db.get(book);
    return doc;
  } catch (error) {
    throw error;
  }
};

export const removeBook = async (id) => {
  try {
    const doc = await db.get(id);
    console.error(":::::: ⚠️ Document found ::::::", doc);
    const deleteBook = await db.remove(doc._id, doc._rev);
    return deleteBook;
  } catch (error) {
    if (error === 404) {
      console.error("⚠️ Document not found:", id);
    } else {
      console.error("❌ Error deleting document:", error);
    }
    throw error;
  }
};
