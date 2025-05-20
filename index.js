import express from "express";
import cors from "cors";
import GigaChat from "gigachat";
import dotenv from "dotenv";
dotenv.config();
const messages = [{
  role: "system",
  content: `Ты AI по имени Супер-пупер. Помогай своему собеседнику.\nПожалуйста, не отвечай на вопросы, связанные с:\n- насилием, угрозами, дискриминацией;\n- нарушением законов;\n- личными данными других людей;\n- нецензурной лексикой и оскорблениями.\nЕсли пользователь задаёт подобные вопросы — вежливо откажись отвечать. Отвечай коротко и пофакту. Если нужно резюмировать - можешь писать длинные ответы`,
}];

const giga = new GigaChat({
  credentials: process.env.GIGA_CHAT_ACCESS_KEY,
});

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

function buildMessages(userMessage) {
  return [systemMessage, { role: "user", content: userMessage }];
}

// POST endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    messages.push({
      role: "user",
      content: message,
    });

    const response = await giga.chat({ messages });

    messages.push({
      role: "assistant",
      content: response.choices[0]?.message.content,
    });

    res.json({
      response: response.choices[0]?.message.content,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
