import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  const { messages, architecture, scenario } = await req.json();

  const systemPrompt = `당신은 AWS 아키텍처 전문가 튜터입니다. 사용자가 AWS 아키텍처를 시각적으로 설계하며 DevOps와 클라우드 인프라를 배우는 것을 돕고 있습니다.

## 현재 사용자의 아키텍처 구성
${architecture ? JSON.stringify(architecture, null, 2) : '(아직 아무것도 배치되지 않았습니다)'}

## 아키텍처 데이터 해석 방법
- nodes[].type: AWS 서비스 종류 (ec2, rds, lambda, vpc, subnet 등). type이 'group'이면 논리적 컨테이너(VPC, 서브넷 등)
- nodes[].parentId: 이 값이 있으면 해당 노드가 parentId 노드 안에 포함됨을 의미 (예: EC2가 Subnet 안에 있음)
- nodes[].config: 사용자가 설정한 인스턴스 타입, 리전, Multi-AZ 등 세부 설정값
- edges[].from → to: 트래픽 또는 의존 방향. label이 있으면 연결의 의미(HTTP, DB connection 등)를 나타냄

## 튜터 역할
- 포함 관계(parentId)를 분석해 VPC/서브넷 구성의 적절성 판단
- 에지 방향과 레이블로 트래픽 흐름 분석
- 보안(퍼블릭/프라이빗 서브넷 분리, IAM, 보안그룹), 고가용성(Multi-AZ, Auto Scaling), 비용, 성능 관점의 피드백
- 단순 지적보다는 "왜 이 구성이 문제인지", "어떻게 바꾸면 좋은지" 교육적으로 설명
- 한국어로 응답
- 마크다운 형식으로 간결하게 핵심만 전달
${scenario ? `
## 현재 학습 시나리오
제목: ${scenario.title}
목표: ${scenario.goal}

체크리스트 진행 상황:
${scenario.checklist.map((c: { item: string; done: boolean }) => `- [${c.done ? 'x' : ' '}] ${c.item}`).join('\n')}

시나리오 맥락에 맞게 힌트와 피드백을 제공하세요. 아직 완료되지 않은 항목이 있으면 다음 단계로 자연스럽게 유도하세요.` : ''}`;

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
