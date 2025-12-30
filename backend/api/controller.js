const handleChat = async (req, res) => {
  const { message, model } = req.body;

  try {
    if (!message || !model) {
      res.status(400).json({
        error: "Message or model name not provided",
      });
      return;
    }

    const available_models = ["gemma:2b"];

    if (!available_models.includes(model)) {
      res.status(400).json({
        error: "The model you requested is either not available or is invalid",
      });
      return
    }

    const query = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: message,
        stream: false,
      }),
    };

    const response = await fetch("http://localhost:11434/api/generate", query);
    // console.log("Hello")
    if (!response.ok) {
      const error_details = await response.json();
      res.status(400).json({
        error: "An error occured while retrieving the response",
        error_details,
      });
      return
    }

    const answer = await response.json();

    res.status(200).json({
      model,
      "date-time": new Date(),
      answer,
    });
    return
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error handling chat", error: error.message });
  }
};

module.exports = {
  handleChat,
};
