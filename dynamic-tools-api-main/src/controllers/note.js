const { Router } = require('express');
const CollectionNote = require('../models/collection-note');

const router = Router({ mergeParams: true });
const noteController = router;

router.delete('/:noteId', async (req, res, next) => {
  const noteId = req.params.noteId;

  if (!noteId) {
    return res.status(400).json({
      ok: false,
      message: 'missing_note_id',
    });
  }

  try {
    await CollectionNote.deleteOne({ _id: noteId });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = noteController;
