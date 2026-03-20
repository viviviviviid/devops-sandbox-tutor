export type Difficulty = '초급' | '중급' | '고급';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  goal: string;
  checklist: string[];
  aiHint: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'simple-web',
    title: '첫 번째 웹 서버',
    description: 'EC2에 웹 서버를 올리고 RDS 데이터베이스에 연결합니다.',
    difficulty: '초급',
    goal: 'EC2와 RDS를 배치하고 연결선을 그어 기본 웹 서버 아키텍처를 만드세요.',
    checklist: [
      'EC2 인스턴스 1개 배치',
      'RDS 데이터베이스 1개 배치',
      'EC2 → RDS 연결',
    ],
    aiHint: '초급 시나리오 "첫 번째 웹 서버"를 시작했습니다. EC2와 RDS를 캔버스에 배치하고 연결하는 것부터 시작해보세요. 먼저 EC2가 무엇인지 설명해드릴까요?',
  },
  {
    id: 'static-hosting',
    title: '정적 웹사이트 호스팅',
    description: 'S3에 정적 파일을 올리고 CloudFront로 전 세계에 빠르게 배포합니다.',
    difficulty: '초급',
    goal: 'S3 버킷과 CloudFront를 배치하고 연결해 CDN 기반 정적 호스팅을 구성하세요.',
    checklist: [
      'S3 버킷 1개 배치',
      'CloudFront 배포 1개 배치',
      'CloudFront → S3 연결',
      'Route 53 도메인 연결 (선택)',
    ],
    aiHint: '초급 시나리오 "정적 웹사이트 호스팅"을 시작했습니다. S3와 CloudFront의 조합이 왜 좋은지 알고 계신가요? 먼저 S3를 캔버스에 올려보세요.',
  },
  {
    id: '3-tier',
    title: '3-Tier 웹 아키텍처',
    description: 'ALB → EC2 → RDS로 이어지는 전통적인 3계층 아키텍처를 VPC 안에 구성합니다.',
    difficulty: '중급',
    goal: 'VPC, Public/Private Subnet을 만들고 ALB, EC2, RDS를 적절한 서브넷에 배치하세요.',
    checklist: [
      'VPC 그룹 생성',
      'Public Subnet, Private Subnet 생성',
      'ALB를 Public Subnet에 배치',
      'EC2를 Private Subnet에 배치',
      'RDS를 Private Subnet에 배치',
      'ALB → EC2 → RDS 연결',
    ],
    aiHint: '중급 시나리오 "3-Tier 웹 아키텍처"를 시작했습니다. VPC 그룹을 먼저 만들고, 그 안에 Public/Private Subnet을 배치하는 것부터 시작해보세요. ALB는 왜 Public Subnet에 있어야 할까요?',
  },
  {
    id: 'serverless-api',
    title: '서버리스 API',
    description: '서버 없이 API Gateway + Lambda + DynamoDB로 완전 관리형 백엔드를 구축합니다.',
    difficulty: '중급',
    goal: 'API Gateway, Lambda, DynamoDB를 배치하고 연결해 서버리스 아키텍처를 완성하세요.',
    checklist: [
      'API Gateway 배치',
      'Lambda 함수 1개 이상 배치',
      'DynamoDB 테이블 배치',
      'API Gateway → Lambda 연결',
      'Lambda → DynamoDB 연결',
      'IAM Role 추가 (선택)',
    ],
    aiHint: '중급 시나리오 "서버리스 API"를 시작했습니다. EC2 대신 Lambda를 쓰면 뭐가 좋을까요? API Gateway부터 배치해보세요.',
  },
  {
    id: 'high-availability',
    title: '고가용성 아키텍처',
    description: '단일 장애 지점(SPOF)을 제거하고 Multi-AZ, Auto Scaling으로 99.9% 가용성을 달성합니다.',
    difficulty: '고급',
    goal: '두 개의 AZ에 걸쳐 ALB, Auto Scaling EC2, Multi-AZ RDS를 구성하세요.',
    checklist: [
      'VPC 안에 AZ-A, AZ-B 두 그룹 생성',
      'ALB 배치 (두 AZ에 걸침)',
      'Auto Scaling 그룹 배치',
      'EC2를 AZ-A, AZ-B 각각 배치',
      'RDS Multi-AZ 설정으로 배치',
      'NAT Gateway 추가 (Private → Internet)',
      'ALB → EC2 → RDS 연결 구성',
    ],
    aiHint: '고급 시나리오 "고가용성 아키텍처"를 시작했습니다. 단일 EC2에 RDS 하나면 어디서 장애가 날 수 있을까요? SPOF를 먼저 생각해보고 시작하세요.',
  },
  {
    id: 'event-driven',
    title: '이벤트 드리븐 마이크로서비스',
    description: 'SQS 메시지 큐로 서비스를 느슨하게 연결하고 SNS로 팬아웃 알림을 구성합니다.',
    difficulty: '고급',
    goal: 'API Gateway → Lambda → SQS → Lambda → RDS 파이프라인을 구성하고 SNS 알림을 추가하세요.',
    checklist: [
      'API Gateway 배치',
      'Producer Lambda 배치',
      'SQS 큐 배치',
      'Consumer Lambda 배치',
      'RDS 또는 DynamoDB 배치',
      'SNS 토픽 배치',
      'API GW → Producer → SQS → Consumer → DB 연결',
      'Consumer → SNS 알림 연결',
    ],
    aiHint: '고급 시나리오 "이벤트 드리븐 마이크로서비스"를 시작했습니다. 동기 호출 대신 SQS를 끼워넣으면 어떤 장점이 있을까요? 핵심 파이프라인부터 그려보세요.',
  },
];

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  '초급': '#68d391',
  '중급': '#f6ad55',
  '고급': '#fc8181',
};
