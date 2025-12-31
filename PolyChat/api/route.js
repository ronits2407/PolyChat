const express = require("express");
const router = express.Router();
const { handleChat } = require("./controller");

router.post("/chat", handleChat);

module.exports = router;
