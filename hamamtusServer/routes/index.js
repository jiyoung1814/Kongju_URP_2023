const express = require('express');
const router = express.Router();

const arduino = require('./arduino/index');
const nsp32 = require('./nsp32/index');

router.use('/arduino', arduino);
router.use('/nsp32', nsp32);

module.exports = router;