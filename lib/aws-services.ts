export interface AWSService {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  defaultConfig: Record<string, string>;
}

export const AWS_SERVICES: AWSService[] = [
  // 네트워크
  { id: 'vpc', name: 'VPC', category: '네트워크', icon: '🌐', color: '#8b5cf6', description: '가상 사설 클라우드 네트워크. 리소스를 격리된 가상 네트워크에 배치합니다.', defaultConfig: { cidr: '10.0.0.0/16', region: 'ap-northeast-2' } },
  { id: 'subnet', name: 'Subnet', category: '네트워크', icon: '🔲', color: '#7c3aed', description: 'VPC 내부의 IP 주소 범위 세그먼트. Public/Private 구분이 핵심입니다.', defaultConfig: { cidr: '10.0.1.0/24', type: 'public' } },
  { id: 'route53', name: 'Route 53', category: '네트워크', icon: '🌍', color: '#9333ea', description: '확장 가능한 DNS 웹 서비스. 도메인 등록 및 라우팅 정책을 설정합니다.', defaultConfig: { recordType: 'A', ttl: '300' } },
  { id: 'cloudfront', name: 'CloudFront', category: '네트워크', icon: '⚡', color: '#a855f7', description: 'AWS CDN 서비스. 전 세계 엣지 로케이션에서 콘텐츠를 캐싱하여 빠르게 제공합니다.', defaultConfig: { priceClass: 'PriceClass_100', cachePolicy: 'CachingOptimized' } },
  { id: 'alb', name: 'ALB', category: '네트워크', icon: '⚖️', color: '#6d28d9', description: 'Application Load Balancer. HTTP/HTTPS 트래픽을 여러 대상으로 분산합니다.', defaultConfig: { scheme: 'internet-facing', port: '443' } },
  { id: 'nlb', name: 'NLB', category: '네트워크', icon: '🔀', color: '#5b21b6', description: 'Network Load Balancer. TCP/UDP 트래픽을 초고성능으로 분산합니다.', defaultConfig: { scheme: 'internet-facing', port: '80' } },
  { id: 'nat', name: 'NAT Gateway', category: '네트워크', icon: '🔄', color: '#7c3aed', description: '프라이빗 서브넷의 인스턴스가 인터넷에 접근하도록 합니다 (인바운드는 차단).', defaultConfig: { type: 'public' } },
  { id: 'igw', name: 'Internet GW', category: '네트워크', icon: '🚪', color: '#8b5cf6', description: 'VPC와 인터넷 간 통신을 가능하게 하는 게이트웨이입니다.', defaultConfig: {} },

  // 컴퓨팅
  { id: 'ec2', name: 'EC2', category: '컴퓨팅', icon: '🖥️', color: '#f59e0b', description: '가상 서버 인스턴스. 다양한 인스턴스 타입으로 원하는 성능을 선택합니다.', defaultConfig: { instanceType: 't3.micro', ami: 'Amazon Linux 2023', count: '1' } },
  { id: 'lambda', name: 'Lambda', category: '컴퓨팅', icon: '⚡', color: '#f97316', description: '서버리스 함수. 코드만 업로드하면 자동으로 실행되며 사용한 만큼만 비용을 냅니다.', defaultConfig: { runtime: 'nodejs20.x', memory: '128', timeout: '3' } },
  { id: 'ecs', name: 'ECS', category: '컴퓨팅', icon: '🐳', color: '#ef4444', description: 'Elastic Container Service. Docker 컨테이너를 AWS에서 실행·관리합니다.', defaultConfig: { launchType: 'FARGATE', cpu: '256', memory: '512' } },
  { id: 'eks', name: 'EKS', category: '컴퓨팅', icon: '☸️', color: '#dc2626', description: 'Elastic Kubernetes Service. 관리형 Kubernetes 클러스터를 제공합니다.', defaultConfig: { version: '1.28', nodeType: 't3.medium' } },
  { id: 'asg', name: 'Auto Scaling', category: '컴퓨팅', icon: '📈', color: '#b45309', description: 'EC2 인스턴스 수를 자동으로 조정합니다. 트래픽에 따라 스케일 아웃/인 합니다.', defaultConfig: { min: '1', max: '10', desired: '2' } },

  // 스토리지
  { id: 's3', name: 'S3', category: '스토리지', icon: '🪣', color: '#10b981', description: '객체 스토리지 서비스. 파일, 이미지, 백업 등을 무제한으로 저장합니다.', defaultConfig: { versioning: 'enabled', encryption: 'SSE-S3' } },
  { id: 'ebs', name: 'EBS', category: '스토리지', icon: '💾', color: '#059669', description: 'EC2용 블록 스토리지. EC2에 마운트하여 하드디스크처럼 사용합니다.', defaultConfig: { type: 'gp3', size: '20' } },
  { id: 'efs', name: 'EFS', category: '스토리지', icon: '📁', color: '#047857', description: '관리형 NFS 파일 시스템. 여러 EC2에서 동시에 마운트 가능합니다.', defaultConfig: { throughputMode: 'bursting' } },

  // 데이터베이스
  { id: 'rds', name: 'RDS', category: '데이터베이스', icon: '🗄️', color: '#3b82f6', description: '관리형 관계형 DB. MySQL, PostgreSQL 등을 AWS가 운영·백업·패치합니다.', defaultConfig: { engine: 'postgres', instanceClass: 'db.t3.micro', multiAZ: 'false' } },
  { id: 'dynamodb', name: 'DynamoDB', category: '데이터베이스', icon: '⚡', color: '#1d4ed8', description: '서버리스 NoSQL DB. 밀리초 응답속도, 자동 스케일링이 특징입니다.', defaultConfig: { billingMode: 'PAY_PER_REQUEST' } },
  { id: 'elasticache', name: 'ElastiCache', category: '데이터베이스', icon: '🚀', color: '#2563eb', description: '인메모리 캐시 서비스 (Redis/Memcached). DB 부하를 줄이고 응답속도를 높입니다.', defaultConfig: { engine: 'redis', nodeType: 'cache.t3.micro' } },
  { id: 'aurora', name: 'Aurora', category: '데이터베이스', icon: '🌟', color: '#1e40af', description: 'AWS 자체 고성능 관리형 DB. MySQL/PostgreSQL 호환이며 RDS보다 최대 5배 빠릅니다.', defaultConfig: { engine: 'aurora-postgresql', instances: '2' } },

  // 메시징
  { id: 'sqs', name: 'SQS', category: '메시징', icon: '📨', color: '#ec4899', description: '메시지 큐 서비스. 서비스 간 비동기 통신을 구현합니다.', defaultConfig: { type: 'Standard', retentionPeriod: '4' } },
  { id: 'sns', name: 'SNS', category: '메시징', icon: '📣', color: '#db2777', description: 'Pub/Sub 메시지 서비스. 하나의 메시지를 여러 구독자에게 동시에 전달합니다.', defaultConfig: { type: 'Standard' } },
  { id: 'eventbridge', name: 'EventBridge', category: '메시징', icon: '🌉', color: '#be185d', description: '서버리스 이벤트 버스. AWS 서비스 이벤트를 라우팅하고 자동화합니다.', defaultConfig: {} },
  { id: 'kinesis', name: 'Kinesis', category: '메시징', icon: '🌊', color: '#9d174d', description: '실시간 데이터 스트리밍 서비스. 대량의 데이터를 실시간으로 수집·처리합니다.', defaultConfig: { shards: '1' } },

  // 보안
  { id: 'iam', name: 'IAM', category: '보안', icon: '🔐', color: '#64748b', description: 'AWS 권한 관리. 사용자·역할·정책으로 AWS 리소스 접근을 제어합니다.', defaultConfig: { type: 'Role' } },
  { id: 'waf', name: 'WAF', category: '보안', icon: '🛡️', color: '#475569', description: 'Web Application Firewall. SQL 인젝션, XSS 등 웹 공격을 차단합니다.', defaultConfig: {} },
  { id: 'secrets', name: 'Secrets Manager', category: '보안', icon: '🔑', color: '#334155', description: 'DB 비밀번호, API 키 등을 안전하게 저장·관리합니다.', defaultConfig: { rotation: 'disabled' } },

  // API/앱
  { id: 'apigw', name: 'API Gateway', category: 'API/앱', icon: '🚦', color: '#14b8a6', description: 'API 생성·배포·관리 서비스. REST/WebSocket API를 만들고 Lambda와 연결합니다.', defaultConfig: { type: 'REST', stage: 'prod' } },
  { id: 'cognito', name: 'Cognito', category: 'API/앱', icon: '👤', color: '#0d9488', description: '사용자 인증 서비스. 회원가입, 로그인, OAuth를 쉽게 구현합니다.', defaultConfig: { mfa: 'OPTIONAL' } },
];

export const CATEGORIES = [...new Set(AWS_SERVICES.map(s => s.category))];

export function getService(id: string): AWSService | undefined {
  return AWS_SERVICES.find(s => s.id === id);
}
