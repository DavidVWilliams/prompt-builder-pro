// File: api/gemini.js
// This code runs securely on Vercel's servers, NOT in the user's browser.

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Grab the prompt and instructions sent from your front-end
  const { input, systemInstruction } = req.body;
  
  // 3. Grab your secure key from Vercel's vault (using the exact name you created!)
  const apiKey = process.env.geminikey; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  try {
    // 4. Make the secure call to Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: input }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Failed to connect to AI.");
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No feedback generated.";
    
    // 5. Send the final text back to your React app
    res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Server API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
