import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  const { serviceId, serviceName, scenarioTitle } = await req.json();

  const message = `사용자가 AWS ${serviceName}(${serviceId})을 아키텍처 캔버스에 처음 배치했습니다.${
    scenarioTitle ? ` 현재 학습 시나리오: "${scenarioTitle}"` : ''
  }

이 서비스가 클라우드 아키텍처에서 어떤 역할을 하는지 2-3문장으로 핵심만 설명해주세요. 현재 시나리오와 연관지어 설명하면 더 좋습니다. 마크다운 형식, 한국어로 응답하세요.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chat = ai.chats.create({
          model: 'gemini-2.0-flash',
          config: {
            systemInstruction:
              '당신은 AWS 아키텍처 전문가 튜터입니다. 학습자가 서비스를 처음 배치할 때 짧고 명확한 힌트를 제공합니다. 2-3문장을 넘지 마세요.',
          },
          history: [],
        });
        const response = await chat.sendMessageStream({ message });
        for await (const chunk of response) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`힌트를 불러오지 못했습니다: ${err}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
