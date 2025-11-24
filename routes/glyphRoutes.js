"use strict";
const express = require('express');
const glyphController = require('../controllers/glyphController');

const router = express.Router();

// get all scripts
router.get('/api/scripts', glyphController.getScripts);
// get all categories
router.get('/api/categories', glyphController.getCategories);
// get all classes
router.get('/api/classes', glyphController.getClasses);
// get all versions
router.get('/api/versions', glyphController.getVersions);
// get all decomposition types
router.get('/api/decomposition-types', glyphController.getDecompositionTypes);
// get characters with optional filters
router.get('/api/characters', glyphController.getCharacters);
// get character by codepoint
router.get('/api/character/:codepoint', glyphController.getCharacter);

module.exports = router;
