const express = require("express");
const router = express.Router();
const { handleChat, createConversation, updateConversation, getConversationTitle, getConversationMessages } = require("./controller");

router.post("/chat", handleChat);
router.route("/conversations").get(getConversationTitle).post(createConversation)
router.route("/conversations/:id").put(updateConversation).get(getConversationMessages)


module.exports = router;
