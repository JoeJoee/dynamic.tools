const mongoose = require('mongoose');
const collectionNoteSchema = require('../schemas/collection-note');

const collectionNote = mongoose.model('CollectionNote', collectionNoteSchema, 'collection-note');

module.exports = collectionNote;
