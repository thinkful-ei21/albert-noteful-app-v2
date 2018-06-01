'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Pulls sample psql db from localhost
const knex = require('../knex');

// Get All Tags (no search filter needed)
router.get('/', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('tags')
    .then(results => res.json(results))
    .catch(err => next(err));
});

// Get Tags by ID
router.get('/:id', (req, res, next) => {
  const tagId = req.params.id;
  knex
    .select('id', 'name')
    .from('tags')
    .where('id', `${tagId}`)
    .then(([ result ]) => res.json(result))
    .catch(err => next(err));
});

// Update Tag (the noteful app does not use this endpoint but we'll create it in order to round out our API)
router.put('/:id', (req, res, next) => {
  const tagId = req.params.id;
  const tagName = req.body.name;
  knex('tags')
    .where('id', `${tagId}`)
    .update('name', `${tagName}`)
    .returning('id', 'name')
    .then(([ result ]) => res.json(result))
    .catch(err => next(err));
});

// Create a Folder accepts an object with a name and inserts it in the DB. Returns the new item along the new id
router.post('/', (req, res, next) => {
  const { name } = req.body;
  /***** Never trust users. Validate input *****/
  if(!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  const newTag = { name };

  knex('tags')
    .insert(newTag)
    .returning('id', 'name')
    .then(([ result ]) => {
      if(result) {res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);}
    })
    .catch(err => next(err));
});

// Delete Folder by ID accepts an ID and deletes the folder from the DB and then returns a 204 status
router.delete('/:id', (req, res, next) => {
  const tagId = req.params.id;
  knex('tags')
    .where('id', `${tagId}`)
    .del()
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;
