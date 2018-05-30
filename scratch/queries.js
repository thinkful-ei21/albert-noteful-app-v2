'use strict';

const knex = require('../knex');


// GET endpoint api/notes for search with/without searchTerm
// let searchTerm = null;
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

// GET rquest to endpoint api/notes/:id for returning a note by referencing its id
// let searchId = 1002;
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     queryBuilder.where('notes.id', `${searchId}`);
//   })
//   .then(([results]) => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.log(err);
//   });


// PUT request to endpoint api/notes/:id for updating notes by id
// let searchId = 1008;
// let updateObject = {title: 'test title ultimate', content: 'ultimate test content'};
// knex('notes')
//   .where('notes.id', `${searchId}`)
//   .update({title: updateObject.title, content: updateObject.content})
//   .returning(['notes.id', 'title', 'content'])
//   .then(([results]) => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.log(err);
//   });

// POST resquest to endpoint api/notes for adding a new note
// let updateObject = {title: 'some title', content: 'some content'};
// knex('notes')
//   .insert({
//     title: updateObject.title,
//     content: updateObject.content
//   })
//   .returning(['notes.id', 'title', 'content'])
//   .then(([results]) => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.log(err);
//   });


// DELETE request to endpoint api/notes for deleting a note by id
// let searchId = 1009;
// knex('notes')
//   .where('notes.id', `${searchId}`)
//   .del()
//   .then(results => {
//     console.log(results);
//   })
//   .catch(err => {
//     console.log(err);
//   });
