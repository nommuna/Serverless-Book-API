const admin = require('firebase-admin');
const functions = require('firebase-functions');
const express = require('express');

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

const app = express();

//Add a book to the database
app.post('/api/v1/book/:title/:id?/:isbn?/:author?/:year?', async (request, response) => {
    try {
        let document = await db.collection('Books').doc(request.params.title);
        await document.set({
            title: request.params.title,
            id: request.params.id,
            isbn: request.params.isbn,
            author: request.params.author,
            year: request.params.year,
        });

        response.send(['Successfully added to the database', request.params]);

    } catch (err) {
        console.log(err);
    }
});

//Add a genre and description to a book
app.post('/api/v1/category/:title/:genre/:description', async (request, response) => {
    try {
        let bookRef = await db.collection('Books').doc(request.params.title);
        let result = await bookRef.set({
            genre: request.params.genre,
            description: request.params.description
        }, {
            merge: true
        });
        response.send([`Category added to the following book: ${request.params.title}`, request.params]);
    } catch (err) {
        console.log(err);
    }
});

//Query a book from the database
app.get('/api/v1/book', (request, response) => {
        let bookRef = db.collection('Books');
        if(request.query.title){
            bookRef.where('title', '==', request.query.title).get().then(snapshot => {
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    response.send(doc.data());
                })
            });
        }else if(request.query.isbn){
            bookRef.where('isbn', '==', request.query.isbn).get().then(snapshot => {
                snapshot.forEach(doc => {
                    response.send(doc.data());
                })
            });
        }else if(request.query.author){
            bookRef.where('author', '==', request.query.author).get().then(snapshot => {
                snapshot.forEach(doc => {
                    response.send(doc.data());
                })
            });
        }
        else {
            let arr = [];
            bookRef.get().then(snapshot => {
                snapshot.forEach(doc => {
                    arr.push(doc.data());
                });
                response.send(arr);
            }).catch(err => {
                console.log(err);
            })
        }
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.app = functions.https.onRequest(app);