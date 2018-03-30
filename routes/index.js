var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect('/view?room=surya');
});

router.get('/view', function(req, res, next) {
    res.render('midi', { title: 'Hydra Midi' });
});

router.get(['/admin', '/host'], function(req, res, next) {
    res.render('host', { title: 'Hydra Admin' });
});

module.exports = router;