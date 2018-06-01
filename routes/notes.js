'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Pulls sample psql db from localhost
const knex = require('../knex');

// Import hydrateNotes function to this file
const hydrateNotes = require('../utils/hydrateNotes');

// GET (read) all (with or without search query)
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  knex
    .select('notes.id', 'notes.title', 'notes.content',
      'folders.id as folderId', 'folders.name as folderName',
      'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .modify(function(queryBuilder) {
      if(searchTerm) {queryBuilder.where('title', 'like', `%${searchTerm}%`);}
    })
    .modify(function(queryBuilder) {
      if(folderId) {queryBuilder.where('folder_id', folderId);}
    })
    .modify(function(queryBuilder) {
      if(tagId) {queryBuilder.where('tag_id', tagId);}
    })
    .orderBy('notes.id')
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// GET (read) a single note
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('notes.id', 'notes.title', 'notes.content',
      'folders.id as folderId', 'folders.name as folderName',
      'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .modify(function(queryBuilder) {
      queryBuilder.where('notes.id', `${id}`);
    })
    .then(result => {
      if (result) {
        const [ hydrated ] = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// PUT (update) an existing item


router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;

  const { title, content, folderId, tags } = req.body;

  const updateItem = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null,
  };

  /***** Never trust users - validate input *****/
  if (!updateItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update(updateItem)
    .where('notes.id', noteId)
    .returning('id')
    .then(([ id ]) => {
      return knex('notes_tags')
        .where('notes_tags.note_id', id)
        .del();
    })
    .then(() => {
      return knex('notes_tags')
        .insert(tags.map(tagId => ({ note_id: noteId, tag_id: tagId})));
    })
    .then(() => {
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(results => {
      if (results) {
        const [ hydrated ] = hydrateNotes(results);
        res.status(200).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// POST (create) a new item
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;
  const newItem = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null,
  };

  /***** Never trust users - validate input *****/
  if(!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;
  // Insert new note into notes table
  knex('notes')
    .insert(newItem)
    .returning('id')
    .then(([ id ]) => {
      // Insert related tags into notes_tags table
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex('notes_tags')
        .insert(tagsInsert);
    })
    .then(() => {
      return knex
        .select('notes.id', 'title', 'content',
          'folders.id as folder_id', 'folders.name as folderName',
          'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(results => {
      if (results) {
        const [ hydrated ] = hydrateNotes(results);
        // Respond with a location header, a 201 status and a note object
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// Delete (delete) an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where('notes.id', `${id}`)
    .del()
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;
