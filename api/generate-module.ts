import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic, subTopic, conceptTricks, description } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const prompt = `
    You are a Senior Banking Quant Content Developer.

    Create a workbook module with the following structure:

    # Chapter: ${topic}
    ## Sub-topic: ${subTopic}

    Approach Name

    Concept Explanation

    3 Worked Examples

    Quick Observation

    Exam Booster

    10 Practice Questions

    Answer Key

    Challenge Zone

    Concepts:
    ${conceptTricks}

    Reference Description:
    ${description}

    Return only clean markdown.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.status(200).json({
      content: response.text,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}