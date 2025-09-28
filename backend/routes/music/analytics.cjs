/**
 * Music Distribution API Routes
 * Ścieżki API dla analityki muzyki
 */

const express = require('express');
const router = express.Router();
const ReleaseController = require('../../music/controllers/release.controller.cjs');

// Initialize controllers
const releaseController = new ReleaseController();

// Release routes
router.post('/releases', releaseController.createRelease.bind(releaseController));
router.get('/releases', releaseController.getReleases.bind(releaseController));
router.get('/releases/recent', releaseController.getRecentReleases.bind(releaseController));
router.get('/releases/upcoming', releaseController.getUpcomingReleases.bind(releaseController));
router.get('/releases/search', releaseController.searchReleases.bind(releaseController));
router.get('/releases/:id', releaseController.getReleaseById.bind(releaseController));
router.put('/releases/:id', releaseController.updateRelease.bind(releaseController));
router.delete('/releases/:id', releaseController.deleteRelease.bind(releaseController));

// Release workflow routes
router.post('/releases/:id/submit', releaseController.submitForDistribution.bind(releaseController));
router.post('/releases/:id/approve', releaseController.approveRelease.bind(releaseController));
router.post('/releases/:id/reject', releaseController.rejectRelease.bind(releaseController));
router.post('/releases/:id/takedown', releaseController.takeDownRelease.bind(releaseController));
router.post('/releases/:id/clone', releaseController.cloneRelease.bind(releaseController));

// Release status and distribution
router.get('/releases/:id/distribution-status', releaseController.getDistributionStatus.bind(releaseController));

// Artist releases
router.get('/artists/:artistId/releases', releaseController.getReleasesByArtist.bind(releaseController));

module.exports = router;
