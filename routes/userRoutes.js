const express = require('express');
const router = express.Router();
const { upload } = require("../server/utils");
const userController = require("../controllers/userController");

router.get("/", userController.user_get_root);
router.get("/requestEvent", userController.user_get_requestEvent);
router.post("/requestEvent", upload.single('inputImage'), userController.user_post_requestEvent);

module.exports = router;