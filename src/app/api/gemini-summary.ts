export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

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
  } = req.body;

  const prompt = `
너는 가상자산 초보 투자자를 위한 “매수 전 브레이크” 분석 도우미다.

목표는 사용자가 FOMO나 충동매수에 휩쓸리지 않도록, 현재 시장 상황을 쉽고 차분하게 설명하는 것이다.

절대 매수/매도 추천을 하지 말고, 투자 판단을 대신하지 않는다.

[입력 데이터]
- 종목명: ${marketName}
- 현재가: ${currentPrice}
- 단기 가격 변동률: ${shortTermChangeRate}%
- 평균 대비 거래량 증가율: ${volumeSpikeRate}배
- 단기 변동성 지표: ${volatilityRate}%
- 24시간 가격 변동률: ${dailyChangeRate}%
- 충동 매수 위험도 점수: ${fomoScore} / 100
- 충동 매수 위험도 등급: ${fomoLevel}

[출력 형식]
1. 한 줄 요약
2. 지금 무슨 일이 일어나고 있나요?
3. 왜 충동매수 위험이 있을 수 있나요?
4. 매수 전 체크할 질문
5. 최종 안내 문구

[말투]
- 친절하고 차분한 말투
- 어려운 금융 용어는 피하기
- 공포를 조장하지 않기
- 매수/매도 추천 금지
- 500자 이내
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
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(500).json({
        message: "Gemini API call failed",
        detail: errorText,
      });
    }

    const data = await response.json();

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return res.status(200).json({
      summary,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}