const { Router } = require('express');
const { version } = require('../../package.json');

const router = Router({ mergeParams: true });
const coreController = router;

router.get('/check', (req, res) => res.json({ ok: true }));
router.get('/version', (req, res) => res.json({ version }));

module.exports = coreController;
