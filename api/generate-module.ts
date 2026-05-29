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