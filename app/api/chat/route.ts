import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  const { messages, architecture } = await req.json();

  const systemPrompt = `당신은 AWS 아키텍처 전문가 튜터입니다. 사용자가 AWS 아키텍처를 시각적으로 설계하는 것을 도와주고 있습니다.

현재 사용자의 아키텍처 구성:
${architecture ? JSON.stringify(architecture, null, 2) : '(아직 아무것도 배치되지 않았습니다)'}

역할:
- 사용자가 배치한 서비스들의 구성이 적절한지 분석
- 보안, 성능, 비용, 고가용성 관점에서 피드백
- 각 AWS 서비스의 역할과 베스트 프랙티스 설명
- 친근하고 교육적인 톤으로 대화
- 한국어로 응답
- 구체적인 개선 제안 제공

답변은 마크다운 형식으로, 간결하게 핵심만 전달하세요.`;

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chat = ai.chats.create({
          model: 'gemini-2.0-flash',
          config: { systemInstruction: systemPrompt },
          history,
        });

        const response = await chat.sendMessageStream({ message: lastMessage.content });
        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`오류가 발생했습니다: ${err}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
