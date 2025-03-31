#! /usr/bin/env node

import { Command } from "commander";
import { addBook, addNote, getBook, removeBook, showAllBook } from "./db.js";
import chalk from "chalk";
import fs from "fs";

const program = new Command();

program.name("munote").description("CLI note taking app").version("1.0.3");

program
  .command("add")
  .alias("a")
  .description("add book/note into book")
  .argument("<book>", "Select book to add note")
  .argument("[note]", "add note or text")
  .action((book, note) => {
    if (!note) {
      addBook(book)
        .then((res) => console.log("Book created successfully:", res))
        .catch((err) => console.error("Failed to create book:", err));
    } else {
      addNote(book, note)
        .then((book) => {
          if (book.ok) {
            getBook(book.id).then((book) => {
              if (book.note.length !== 0) {
                console.log(
                  `Note added to book ${chalk.bold(
                    book.name
                  )}, total records ${chalk.bold(
                    "[" + book.note.length + "]"
                  )}  `
                );
                book.note.forEach((note, index) => {
                  console.log(`${index + 1}. ${note}`);
                });
              }
            });
          } else {
            getBook(book.name).then((book) => {
              if (book.note.length !== 0) {
                console.log(`Note alreday exists in: ${chalk.bold(book.name)}`);
              }
            });
          }
        })
        .catch((error) =>
          console.error("Error, while creating the note,", error)
        );
    }
  });

program
  .command("view")
  .alias("v")
  .description("Show/list all books or content of the book")
  .argument("[book]", "Book name, which has notes (optional)")
  .action((book) => {
    if (!book) {
      showAllBook()
        .then((docs) => {
          docs.forEach((doc, index) => {
            console.log(
              `\t${chalk.gray("|-")} ${chalk.bold.green(doc.name)} ${chalk.bold(
                "(" + doc.note.length + ")"
              )}`
            );
          });
        })
        .catch((err) => console.error("Error fetching all books,", err));
    } else {
      getBook(book)
        .then((book) => {
          if (book.note.length !== 0) {
            console.log(`\t${chalk.bold("*")} ${chalk.bold.green(book.name)}`);
            book.note.forEach((note, index) => {
              console.log(`\t${index + 1}. ${note}`);
            });
          } else {
            console.log(`Found zero note in the [${book.name}]`);
            console.log(
              `run \n $ :${chalk.bold(
                "munote add " + book.name
              )} ${chalk.italic(
                "[note/text]"
              )} to create note inside ${chalk.bold(book.name)}`
            );
          }
        })
        .catch((error) => {
          if (error && error.status === 404) {
            console.error(
              chalk.bold.black.bgYellow(`Error retrieving :: ${book}`)
            );
            console.log(
              `run \n $: ${chalk.bold(
                "munote add " + book
              )} to create book, \n $: ${chalk.bold(
                "munote add " + book
              )} [ note/text ] to create note inside ${book}`
            );
          }
        });
    }
  });

program
  .command("delete")
  .description("delete note or book")
  .alias("rm")
  .argument("<book>", "Delete the book")
  .action((book) => {
    removeBook(book)
      .then((book) => console.log("Successfully removed book:", book))
      .catch((error) => console.error("Error:", error));
  });

program
  .command('export')
  .description('export note inot text file')
  .argument('<book>', 'Notes form the book to export')
  .action((book) => {
    getBook(book)
    .then(book => {
      console.log(">>>", book.note);
      fs.writeFile("note.text", "", (err) => {
        if (err) console.error("Error clearing file:", err);
        else console.log(`❌ Notes cleared in note.text`);
      });
  
      book.note.forEach(note => {
        fs.appendFile("note.text", note + "\n",  (err) => {
          if (err) {
            console.error("Error writing to file:", err);
          } else {
            console.log(`✅ Note saved to note.text`);
          }
        });
      })
    })
  })

program.showSuggestionAfterError(true);
program.parse(process.argv);
