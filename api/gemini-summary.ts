export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!apiKey) {
    return res.status(500).json({ message: "Gemini API key is missing" });
  }

  const {
    marketName,
    currentPrice,
    shortTermChangeRate,
    volumeSpikeRate,
    volatilityRate,
    dailyChangeRate,
    fomoScore,
    fomoLevel,
  } = req.body ?? {};

  const prompt = `
너는 가상자산 초보 투자자를 위한 “매수 전 브레이크” 분석 도우미다.

목표는 사용자가 FOMO나 충동매수에 휩쓸리지 않도록, 현재 시장 상황을 쉽고 차분하게 설명하는 것이다.

절대 매수/매도 추천을 하지 말고, 투자 판단을 대신하지 않는다.

사용자가 지금 사려는 종목이 왜 위험할 수 있는지, 또는 어떤 점을 더 확인해야 하는지 초보자도 이해할 수 있는 말로 설명한다.

다음 데이터를 바탕으로 분석하라.

[입력 데이터]
- 종목명: ${marketName}
- 현재가: ${currentPrice}
- 최근 단기 상승률: ${shortTermChangeRate}%
- 최근 거래량 증가율: ${volumeSpikeRate}배
- 변동성 확대율: ${volatilityRate}%
- 24시간 상승률: ${dailyChangeRate}%
- FOMO 위험 점수: ${fomoScore} / 100
- FOMO 위험 등급: ${fomoLevel}

[출력 형식]
1. 한 줄 요약
현재 시장 상황을 초보자가 바로 이해할 수 있게 한 문장으로 설명한다.

2. 지금 무슨 일이 일어나고 있나요?
가격 상승률, 거래량 증가, 변동성을 바탕으로 현재 시장 상황을 쉽게 설명한다.

3. 왜 충동매수 위험이 있을 수 있나요?
FOMO 가능성을 설명하되, 겁을 주지 말고 차분하게 알려준다.

4. 매수 전 체크할 질문
사용자가 스스로 판단할 수 있도록 3개의 질문을 제시한다.

5. 최종 안내 문구
“이 정보는 투자 추천이 아니라 매수 전 판단을 돕기 위한 참고 정보입니다.”라는 취지를 포함한다.

[말투]
- 친절하고 차분한 말투
- 어려운 금융 용어는 피하기
- 초보자도 이해할 수 있게 설명
- 공포를 조장하지 않기
- “무조건 사지 마세요”, “반드시 매수하세요” 같은 표현 금지
- 500자 이내로 작성
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      return res.status(response.status).json({
        message: "Gemini API call failed",
        detail,
      });
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return res.status(200).json({ summary });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
