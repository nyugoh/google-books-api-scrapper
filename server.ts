import 'module-alias/register'; // import for all the module settings in package.json to work
import 'universal-dotenv'; // import to load .env file
import chalk from 'chalk';
import axios from 'axios';
import {CronJob} from 'cron';
import {Sequelize} from "sequelize-typescript";
import dbConfig, {models, syncOptions} from "./src/database";
import LibraryCatalogue from 'LibraryCatalogue';
import * as fs from "fs";

let timer;
let isRunning: boolean = false;
let currentBookIndex = 154;
let book: LibraryCatalogue;
const db = new Sequelize(dbConfig);
db.addModels(models);
const instance = axios.create({
    baseURL: "https://www.googleapis.com",
    headers: {
        "key": process.env.GBS_API_KEY
    }
});

function syncDB() {
    db.sync(syncOptions).then(() => {
        console.log(chalk.green("✓ Database connection successful"));
    }).catch(e => {
        console.error(chalk.red(e));
    });
}

async function fetchBooks() {
    saveCurrentIndex();
    let author: String = '';
    let description: String = '';
    let imageLinks = {};
    let volumeInfo;
    let searchInfo;

    try {
        book = await LibraryCatalogue.findById(currentBookIndex);
        if (book == null) return;
        console.log(chalk.greenBright(`Fetched book successfully:: ${currentBookIndex}`));
    } catch (error) {
        logError(error);
    }

    // Check if book has author field
    if (book.authors !== null) {
        // Check if it's multiple authors
        if (book.authors.indexOf(',') !== -1 && book.authors.trim().length > 0) {
            // Book has multiple authors
            book.authors.split(',').forEach(author => {
                author += `+inauthor:${author}`;
            });
        } else {
            // Book has single author
            author = `+inauthor:${book.authors}`;
        }
    }

    // Make request to GBS API
    try {
        console.log(chalk.blue('Making request to Google Books'));
        console.log(chalk.blueBright(`Book title: ${book.title}`));
        let response = await instance.get('books/v1/volumes', {
            params: {
                "q": `${book.title}${author}`,
            }
        });
        console.log(chalk.green(response.request.path));
        if (response.data.totalItems > 0) {
            response.data.items.forEach((_book) => {
                if (_book.volumeInfo.title == book.title) {
                    // if (_book.volumeInfo.title == book.title && _book.volumeInfo.authors.indexOf(book.authors) !== -1) {
                    console.log(chalk.greenBright('Found a match in results'));
                    volumeInfo = _book.volumeInfo;
                    searchInfo = _book.searchInfo;
                    if (volumeInfo.description !== null) {
                        description = volumeInfo.description;
                    } else if (searchInfo !== null) {
                        description = searchInfo.textSnippet;
                    }
                    if (volumeInfo.imageLinks !== null) {
                        imageLinks = volumeInfo.imageLinks;
                    }
                    return;
                }

            });
        } else {
            console.log(chalk.red('No match found'));
            return;
        }

        if (volumeInfo != null) {
            let thumbnail = '';
            let smallThumbnail = '';
            let data = {
                description: book.description,
                smallThumbnail: book.smallThumbnail,
                thumbnail: book.thumbnail,
                maturityRating: volumeInfo.maturityRating,
                pages: volumeInfo.pageCount,
                publishDate: volumeInfo.publishedDate,
            };

            console.log(chalk.green('Found some info'));
            if (description) {
                console.log(`Description:: ${description}`);
                data.description = description;
            }
            if (imageLinks) {
                console.log(`Image Links::`);
                console.log(imageLinks);
                if (imageLinks.hasOwnProperty('smallThumbnail'))
                    smallThumbnail = imageLinks['smallThumbnail'];
                if (imageLinks.hasOwnProperty('small'))
                    smallThumbnail = imageLinks['small'];
                if (imageLinks.hasOwnProperty('medium'))
                    smallThumbnail = imageLinks['medium'];
                if (imageLinks.hasOwnProperty('large'))
                    thumbnail = imageLinks['large'];
                if (imageLinks.hasOwnProperty('extraLarge'))
                    thumbnail = imageLinks['extraLarge'];
                if (imageLinks.hasOwnProperty('thumbnail'))
                    thumbnail = imageLinks['thumbnail'];

                if (thumbnail.length > 0 && book.thumbnail.length <= 0)
                    data.thumbnail = thumbnail;
                if (smallThumbnail.length > 0 && book.smallThumbnail.length <= 0)
                    data.smallThumbnail = smallThumbnail;
            }
            try {
                console.log(chalk.blue('Updating records with'));
                console.log(data);
                await LibraryCatalogue.update(data, {where: {id: currentBookIndex}});
                console.log(chalk.greenBright('Book updated successfully'));
            } catch (error) {
                logError(error);
            }
        } else {
            console.log(chalk.red('No data to check'));
            return;
        }
    } catch (error) {
        logError(error);
    }
}

function logError(error) {
    console.log(chalk.red(`Error occurred: Current index: ${currentBookIndex}`));
    console.log(chalk.red('Error : ') + chalk.redBright(error.message));
    console.log(error.response.statusText);
    fs.appendFile("error-log.txt", `\n${new Date()}:- Book ID: ${currentBookIndex} - ${error.response.statusText}`, 'utf8',(err) => {
        if (err) console.log(err);
        console.log(chalk.green("Successfully written error to file."));
    });
}


function saveCurrentIndex() {
    fs.writeFile("currentIndex.txt", currentBookIndex.toString(), (err) => {
        if (err) console.log(err);
        console.log(chalk.green("Successfully written progress to file."));
    });
}

function getCurrentIndex(): number {
    let index: number = currentBookIndex;
    console.log(chalk.green('Reading current index'));
    try {
        let res = fs.readFileSync("currentIndex.txt", {encoding: 'utf8'});
        index = parseInt(res.toString());
    } catch (error) {
        logError(error);
    }
    return index;
}

function runJob() {
    timer = setInterval(async function () {
        currentBookIndex = getCurrentIndex();
        currentBookIndex++;
        await fetchBooks();
    }, 20000);

}

const stopJob = new CronJob('0 */10 * * * *', function () {
    if (isRunning) {
        console.log(chalk.blue('Cron job paused'));
        clearInterval(timer);
        isRunning = false;
    } else {
        console.log(chalk.yellow('Cron job running'));
        runJob();
        isRunning = true;
    }
}, null, true, 'Africa/Nairobi');


syncDB();
stopJob.start();
