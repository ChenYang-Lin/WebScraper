const express = require('express');
const router = express.Router();

const { upload } = require("../server/utils");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

// Subscription routes
router.get("/subscription", authController.checkAuthenticated, adminController.admin_get_subscription);
router.post("/subscription/update", authController.checkAuthenticated, adminController.admin_post_subscription_update);
router.post("/subscription/add", authController.checkAuthenticated, adminController.admin_post_subscription_add);

// Manually Add Event routes
router.get("/manuallyAddEvent", authController.checkAuthenticated, adminController.admin_get_manuallyAddEvent);
router.post("/manuallyAddEvent", authController.checkAuthenticated, upload.single('inputImage'), adminController.admin_post_manuallyAddEvent);
router.post("/manuallyAddEvent/remove", authController.checkAuthenticated, adminController.admin_post_manuallyAddEvent_remove);

// Manage Requests
router.get("/manageRequests", authController.checkAuthenticated, adminController.admin_get_manageRequests);
router.post("/manageRequests", authController.checkAuthenticated, adminController.admin_post_manageRequests);

// manually scrape
router.post("/scrape", authController.checkAuthenticated, adminController.admin_post_scrape)
router.post("/progress", authController.checkAuthenticated, adminController.admin_post_progress)



module.exports = router;
