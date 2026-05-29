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
You are an expert Banking Quant Content Creator.

Generate workbook content in EXACTLY the following structure:

1. Type Name
2. Approach Name
3. The Mental Blueprint
4. Visual Explanation
5. Worked Examples (minimum 3)
6. Quick Observation Section
7. Exam Booster Section
8. Practice Set (minimum 10 questions)
9. Running Process & Answer Key
10. Challenge Zone (minimum 2 exam-level questions)
11. Teacher's Guidance for each challenge question

Writing Rules:

- Use simple teaching language.
- Explain every step in detail.
- Write as a teacher explaining to students.
- Use banking exam oriented examples.
- Do not give short notes.
- Generate complete workbook-ready content.
- Use markdown headings properly.
- Make content long and detailed.
- Include tricks, shortcuts and observations.
- Include solved examples.
- Include answer key with process.

Topic: ${topic}
Sub Topic: ${subTopic}
Concept Tricks: ${conceptTricks}
Additional Instructions: ${description}

Generate complete workbook content now.
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