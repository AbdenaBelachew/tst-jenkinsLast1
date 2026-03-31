const express = require('express');
const TestController = require('../controllers/testController');

const router = express.Router();

router.post('/add', TestController.addItem);
router.get('/list', TestController.getItems);

module.exports = router;
