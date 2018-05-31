'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// actual psql db from localhost
const knex = require('../knex');

// Get All Folders (no search filter needed)
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => res.json(results))
    .catch(err => next(err));
});

// Get Folder by id
router.get('/:id', (req, res, next) => {
  const folderId = req.params.id;
  knex.select('id', 'name')
    .from('folders')
    .where('id', `${folderId}`)
    .then(([ result ]) => res.json(result))
    .catch(err => next(err));
});

// Update Folder The noteful app does not use this endpoint but we'll create it in order to round out our API
router.put('/:id', (req, res, next) => {
  const folderId = req.params.id;
  const folderName = req.body.name;
  knex('folders')
    .where('id', `${folderId}`)
    .update('name', `${folderName}`)
    .returning('id', 'name')
    .then(([ result ]) => res.json(result))
    .catch(err => next(err));
});

// Create a Folder accepts an object with a name and inserts it in the DB. Returns the new item along the new id
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const folderName = name;
  knex('folders')
    .insert({name: folderName})
    .returning('id', 'name')
    .then(([ result ]) => {
      if(result) {res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);}
    })
    .catch(err => next(err));
});

// Delete Folder By Id accepts an ID and deletes the folder from the DB and then returns a 204 status
router.delete('/:id', (req, res, next) => {
  const folderId = req.params.id;
  knex('folders')
    .where('id', `${folderId}`)
    .del()
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;
