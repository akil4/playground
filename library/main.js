const library = [];

function Book(title, author, pages, isRead) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
}

function addBookToLibrary(title, author, pages, isRead) {
    const newBook = new Book(title, author, pages, isRead);
    library.push(newBook);
    return newBook;
}

addBookToLibrary("The Hobbit", "J.R.R. Tolkien", 310, false);