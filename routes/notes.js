'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Pulls sample psql db from localhost
const knex = require('../knex');

// Get all (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm, folderId } = req.query;

  knex
    .select('notes.id', 'notes.title', 'notes.content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(function(queryBuilder) {
      if(searchTerm) {queryBuilder.where('title', 'like', `%${searchTerm}%`);}
    })
    .modify(function(queryBuilder) {
      if(folderId) {queryBuilder.where('folder_id', folderId);}
    })
    .orderBy('notes.id')
    .then(results => res.json(results))
    .catch(err => next(err));
});

// Get/Read a single note
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('notes.id', 'notes.title', 'notes.content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(function(queryBuilder) {
      queryBuilder.where('notes.id', `${id}`);
    })
    .then(results => res.json(results))
    .catch(err => next(err));
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];
  
  updateableFields.forEach(field => {
    if(field in req.body) {updateObj[field] = req.body[field];}
  });
  /***** Never trust users - validate input *****/
  if(!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .where('notes.id', `${id}`)
    .update({title: updateObj.title, content: updateObj.content})
    .returning(['notes.id', 'title', 'content'])
    .then(([ result ]) => res.json(result))
    .catch(err => next(err));
});


// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content } = req.body;
  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if(!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .insert({
      title: newItem.title,
      content: newItem.content
    })
    .returning(['notes.id', 'title', 'content'])
    .then(([ results ]) => {
      if(results) {res.location(`http://${req.headers.host}/notes/${results.id}`).status(201).json(results);}
    })
    .catch(err => next(err));
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where('notes.id', `${id}`)
    .del()
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;
