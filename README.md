# CloudSandbox

AWS 아키텍처 학습 플랫폼. AWS 서비스를 드래그&드롭으로 캔버스에 배치하고, AI 튜터에게 실시간 피드백을 받으며 DevOps·클라우드 인프라를 익힙니다.

## 주요 기능

| 기능 | 설명 |
|---|---|
| **드래그&드롭 캔버스** | 30+ AWS 서비스와 VPC/Subnet 그룹 컨테이너 |
| **AI 아키텍처 튜터** | Gemini 2.0 Flash 기반 실시간 스트리밍 피드백 |
| **서비스 힌트** | 처음 배치하는 서비스마다 AI 자동 힌트 (세션 내 1회) |
| **학습 시나리오** | 초급~고급 6개 시나리오 + 체크리스트 진행률 |
| **아키텍처 점수** | 보안·고가용성·비용 최적화 15개 규칙 실시간 채점 |
| **Undo/Redo** | 전체 캔버스 히스토리 (Ctrl+Z / Ctrl+Y) |
| **커스텀 에지** | 에지 타입 변경, 레이블 편집, 우클릭 메뉴 |
| **내보내기** | JSON 저장/불러오기, PNG 내보내기 |

## 학습 시나리오

- **초급** — 첫 번째 웹 서버 (EC2 + RDS)
- **초급** — 정적 웹사이트 호스팅 (S3 + CloudFront)
- **중급** — 3-Tier 웹 아키텍처 (VPC + ALB + EC2 + RDS)
- **중급** — 서버리스 API (API Gateway + Lambda + DynamoDB)
- **고급** — 고가용성 아키텍처 (Multi-AZ + Auto Scaling)
- **고급** — 이벤트 드리븐 마이크로서비스 (SQS + SNS + Lambda)

## 시작하기

```bash
npm install
# GEMINI_API_KEY 환경변수 설정 필요
cp .env.example .env.local   # GEMINI_API_KEY=...
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 환경변수

| 변수 | 설명 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio에서 발급 |

## 기술 스택

- **Next.js 15** (App Router) + TypeScript
- **@xyflow/react** — 인터랙티브 캔버스
- **Zustand** — 상태 관리 (canvas / ai / scenario)
- **Google Gemini 2.0 Flash** — AI 튜터 (스트리밍)
- **html-to-image** — PNG 내보내기

## 단축키

| 단축키 | 동작 |
|---|---|
| `Ctrl+Z` | 실행취소 |
| `Ctrl+Y` / `Ctrl+Shift+Z` | 다시실행 |
| `?` | 단축키 패널 토글 |
| `Delete` / `Backspace` | 선택 노드 삭제 |
| 노드 더블클릭 | 레이블 편집 |
| 에지 더블클릭 | 에지 레이블 편집 |
| 우클릭 | 컨텍스트 메뉴 |
