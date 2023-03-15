import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BooksApiActions, BooksPageActions } from '@book-co/books-page/actions';
import {
  BookModel,
  BookRequiredProps,
  calculateBooksGrossEarnings,
} from '@book-co/shared-models';
import {} from '@book-co/shared-state-books';
import { BooksService } from '@book-co/shared-services';

@Component({
  selector: 'bco-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.scss'],
})
export class BooksPageComponent implements OnInit {
  books: BookModel[] = [];
  currentBook: BookModel | null = null;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  total: number = 0;

  constructor(private booksService: BooksService, private store: Store) {}

  ngOnInit() {
    this.getBooks();
    this.removeSelectedBook();

    this.store.dispatch(BooksPageActions.enter());
  }

  getBooks() {
    this.booksService.all().subscribe((books) => {
      this.books = books;
      this.updateTotals(books);

      this.store.dispatch(BooksApiActions.booksLoaded({books: books}))
    });
  }

  updateTotals(books: BookModel[]) {
    this.total = calculateBooksGrossEarnings(books);
  }

  onSelect(book: BookModel) {
    this.store.dispatch(BooksPageActions.selectBook({
      bookId: book.id
    }));

    this.currentBook = book;
  }

  onCancel() {
    this.removeSelectedBook();
  }

  removeSelectedBook() {
    this.store.dispatch(BooksPageActions.clearSelectedBook());
    this.currentBook = null;
  }

  onSave(book: BookRequiredProps | BookModel) {
    if ('id' in book) {
      this.updateBook(book);
    } else {
      this.saveBook(book);
    }
  }

  saveBook(bookProps: BookRequiredProps) {
    this.store.dispatch(BooksPageActions.createBook({
      book: bookProps
    }));

    this.booksService.create(bookProps).subscribe((book) => {
      this.getBooks();
      this.removeSelectedBook();

      this.store.dispatch(BooksApiActions.bookCreated({book: book}));
    });
  }

  updateBook(book: BookModel) {
    this.store.dispatch(BooksPageActions.updateBook({
      bookId: book.id,
      changes: book
    }));

    this.booksService.update(book.id, book).subscribe((book) => {
      this.getBooks();
      this.removeSelectedBook();

      this.store.dispatch(BooksApiActions.bookUpdated({book: book}))
    });
  }

  onDelete(book: BookModel) {
    this.store.dispatch(BooksPageActions.deleteBook({
      bookId: book.id
    }));

    this.booksService.delete(book.id).subscribe(() => {
      this.getBooks();
      this.removeSelectedBook();

      this.store.dispatch(BooksApiActions.bookDeleted({bookId: book.id}))
    });
  }
}
