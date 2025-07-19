export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { keyword, filteredIngredients, ingredients } = req.body;
  const ingList = filteredIngredients || ingredients;

  if (!keyword || !ingList || !Array.isArray(ingList)) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that suggests similar ingredient names.",
          },
          {
            role: "user",
            content: `次のリストの中から「${keyword}」に最も近い[食材名]を必ず4つ選んでください。
選び方の方針：
- 同義語・表記揺れ
- 打ち間違い
- タイプが近い食材
- それでも無い場合、最も近いと思われるものを機械的に選択

リスト：
${ingList.join(", ")}`,
          },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const suggestionText = data.choices?.[0]?.message?.content || "";

    res.status(200).json({ suggestion: suggestionText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI API request failed" });
  }
}
