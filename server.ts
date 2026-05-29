import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post("/api/generate-module", async (req, res) => {
    const { topic, subTopic, conceptTricks, description } = req.body;
    
    if (!topic || !subTopic) {
        return res.status(400).json({ error: "Chapter and sub-topic are required." });
    }

    const prompt = `
    You are an expert Senior Banking Quant Content Developer and Instructional Designer with 10+ years of experience specializing in Speed Arithmetic for competitive exams (Banking).

    Your task is to take this Chapter: "${topic}", Sub-topic: "${subTopic}", Concept/Tricks: "${conceptTricks}", and Reference Description/Context: "${description}" and convert it into a highly structured, book-ready chapter module for a professional workbook.

    Follow these absolute rules:
    1. LANGUAGE: Use English only. Use a warm, encouraging, classroom teacher-style tone ("Let us look at a simple way...").
    2. NO MATH FORMATTING SYMBOLS: Do NOT use any dollar signs ($) or markdown math blocks for numbers or equations. Write math operators and equations using standard plain keyboard characters.
    3. FORMAT: Use Markdown formatting to ensure a professional book-style layout. Use # for major titles, ## for sub-titles, ** for bold, > for blockquotes.
    4. STRUCTURE:
       # Chapter: ${topic}
       ## Sub-topic: ${subTopic}
       **Approach Name:** [Insert Name]
       > **Concept Box**
       > [Write concept description here]
       
       ### Visual Explanation
       [Draw simple text-based ASCII flowchart tracking steps]
       
       ### Worked Examples
       **Example 1:** [Example 1]
       **Example 2:** [Example 2]
       **Example 3:** [Example 3]
       
       ### Quick Observation Section
       [Observation]
       
       ### Exam Booster Section
       [Dynamic shortcuts or clever hacks]

       ### Practice Set
       Try to solve these 10 questions using only the methods detailed above. Avoid writing down any intermediate steps!
       [Exactly 10 plain text questions]

       ### Answer Key
       [Exactly 10 answers only, no explanations]

       ### Challenge Zone
       [Exactly 2 higher-level or multi-step questions with teacher's guidance]
       
    5. EXAMPLES POLICY: Create 100% original math data.
    6. PAGE LENGTH CONTROL: Keep the content tightly optimized.
    `;

    try {
        let responseText = "";
        let retries = 3;
        
        while (retries > 0) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
                responseText = response.text!;
                break;
            } catch (error: any) {
                if (error.status === 503 && retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                throw error;
            }
        }
        res.json({ content: responseText });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: "Failed to generate content after retries." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
