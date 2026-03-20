import { Node, Edge } from '@xyflow/react';
import { NodeData } from '@/store/canvas';

export interface RuleResult {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
}

export interface CategoryScore {
  label: string;
  emoji: string;
  score: number; // 0–100
  rules: RuleResult[];
}

export interface ScoreResult {
  total: number; // 0–100
  categories: CategoryScore[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serviceNodes(nodes: Node<NodeData>[], ...ids: string[]): Node<NodeData>[] {
  return nodes.filter((n) => n.type === 'awsNode' && ids.includes(n.data.serviceId));
}

function hasService(nodes: Node<NodeData>[], ...ids: string[]): boolean {
  return serviceNodes(nodes, ...ids).length > 0;
}

function isInPrivateSubnet(node: Node<NodeData>, nodes: Node<NodeData>[]): boolean {
  if (!node.parentId) return false;
  const parent = nodes.find((n) => n.id === node.parentId);
  return !!parent && String(parent.data.label).toLowerCase().includes('private');
}

function edgesBetween(
  nodes: Node<NodeData>[],
  edges: Edge[],
  aIds: string[],
  bIds: string[]
): boolean {
  const aSet = new Set(serviceNodes(nodes, ...aIds).map((n) => n.id));
  const bSet = new Set(serviceNodes(nodes, ...bIds).map((n) => n.id));
  return edges.some(
    (e) =>
      (aSet.has(e.source) && bSet.has(e.target)) ||
      (aSet.has(e.target) && bSet.has(e.source))
  );
}

function countGroups(nodes: Node<NodeData>[], labelContains: string): number {
  return nodes.filter(
    (n) =>
      n.type === 'groupNode' &&
      String(n.data.label).toLowerCase().includes(labelContains.toLowerCase())
  ).length;
}

function categoryScore(rules: RuleResult[]): number {
  if (rules.length === 0) return 0;
  return Math.round((rules.filter((r) => r.passed).length / rules.length) * 100);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function computeScore(nodes: Node<NodeData>[], edges: Edge[]): ScoreResult {
  const dbNodes = serviceNodes(nodes, 'rds', 'aurora', 'dynamodb');

  // ── 보안 ──────────────────────────────────────────────────────────────────

  const dbInPrivate =
    dbNodes.length === 0 || dbNodes.every((n) => isInPrivateSubnet(n, nodes));

  const securityRules: RuleResult[] = [
    {
      id: 'db-private',
      label: 'DB가 Private Subnet에 위치',
      passed: dbInPrivate,
      tip: 'RDS/Aurora/DynamoDB는 Private Subnet에 배치해 직접 노출을 막으세요.',
    },
    {
      id: 'load-balancer',
      label: '로드 밸런서(ALB/NLB)로 트래픽 분리',
      passed: hasService(nodes, 'alb', 'nlb'),
      tip: 'ALB나 NLB를 앞단에 두어 백엔드 서버를 직접 외부에 노출하지 마세요.',
    },
    {
      id: 'iam',
      label: 'IAM Role 정의',
      passed: hasService(nodes, 'iam'),
      tip: 'IAM을 추가해 각 서비스에 최소 권한만 부여하세요.',
    },
    {
      id: 'waf',
      label: 'WAF로 웹 트래픽 방어',
      passed: hasService(nodes, 'waf'),
      tip: 'WAF를 ALB 또는 CloudFront 앞에 두어 OWASP 공격을 차단하세요.',
    },
    {
      id: 'auth',
      label: '인증 서비스(Cognito) 활용',
      passed: hasService(nodes, 'cognito'),
      tip: 'Cognito로 인증·인가를 직접 구현하지 않고 위임하세요.',
    },
  ];

  // ── 고가용성 ──────────────────────────────────────────────────────────────

  const multiAZ =
    countGroups(nodes, 'availability zone') >= 2 ||
    countGroups(nodes, 'az-') >= 2 ||
    countGroups(nodes, 'az ') >= 2;

  const hasRDSMultiAZ =
    serviceNodes(nodes, 'rds').some((n) => n.data.config?.multiAZ === 'true') ||
    hasService(nodes, 'aurora');

  const availabilityRules: RuleResult[] = [
    {
      id: 'alb',
      label: 'Application Load Balancer 배치',
      passed: hasService(nodes, 'alb'),
      tip: 'ALB 없이 EC2를 직접 노출하면 단일 장애 지점(SPOF)이 됩니다.',
    },
    {
      id: 'autoscaling',
      label: 'Auto Scaling으로 탄력적 확장',
      passed: hasService(nodes, 'asg'),
      tip: 'Auto Scaling Group을 추가해 트래픽 급증 시 자동으로 확장하세요.',
    },
    {
      id: 'multi-az',
      label: '다중 AZ 구성 (SPOF 제거)',
      passed: multiAZ,
      tip: 'Availability Zone 그룹을 2개 이상 만들어 AZ 장애에 대비하세요.',
    },
    {
      id: 'db-ha',
      label: 'DB 고가용성 (RDS Multi-AZ / Aurora)',
      passed: hasRDSMultiAZ,
      tip: 'RDS Multi-AZ를 활성화하거나 Aurora를 사용해 DB 자동 복구를 설정하세요.',
    },
    {
      id: 'cache',
      label: '캐시 레이어(ElastiCache) 추가',
      passed: hasService(nodes, 'elasticache'),
      tip: 'ElastiCache로 DB 부하를 분산시켜 DB 장애 영향 범위를 줄이세요.',
    },
  ];

  // ── 비용 최적화 ───────────────────────────────────────────────────────────

  const hasCDN =
    hasService(nodes, 's3') &&
    hasService(nodes, 'cloudfront') &&
    edgesBetween(nodes, edges, ['cloudfront'], ['s3']);

  const costRules: RuleResult[] = [
    {
      id: 'serverless',
      label: '서버리스(Lambda) 활용',
      passed: hasService(nodes, 'lambda'),
      tip: 'Lambda는 유휴 시간에 비용이 없어 간헐적 워크로드에 EC2보다 경제적입니다.',
    },
    {
      id: 'cdn',
      label: 'CloudFront + S3로 정적 자산 분리',
      passed: hasCDN,
      tip: 'S3 + CloudFront 조합은 EC2에서 정적 파일을 서빙하는 것보다 훨씬 저렴합니다.',
    },
    {
      id: 'autoscaling-cost',
      label: 'Auto Scaling으로 과잉 프로비저닝 방지',
      passed: hasService(nodes, 'asg'),
      tip: '고정 EC2 대수 대신 Auto Scaling을 써서 실제 트래픽에 맞게 조절하세요.',
    },
    {
      id: 'async',
      label: '비동기 처리(SQS/SNS/EventBridge) 활용',
      passed: hasService(nodes, 'sqs', 'sns', 'eventbridge', 'kinesis'),
      tip: '메시지 큐를 사용하면 피크 부하를 분산해 인스턴스 스펙을 낮출 수 있습니다.',
    },
    {
      id: 'cache-cost',
      label: '캐시(ElastiCache)로 DB 비용 절감',
      passed: hasService(nodes, 'elasticache'),
      tip: '반복 쿼리를 캐싱하면 RDS 인스턴스 스펙을 낮추거나 읽기 복제본을 줄일 수 있습니다.',
    },
  ];

  const categories: CategoryScore[] = [
    { label: '보안', emoji: '🔒', score: categoryScore(securityRules), rules: securityRules },
    { label: '고가용성', emoji: '⚡', score: categoryScore(availabilityRules), rules: availabilityRules },
    { label: '비용 최적화', emoji: '💰', score: categoryScore(costRules), rules: costRules },
  ];

  const total = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length
  );

  return { total, categories };
}

export function scoreColor(score: number): string {
  if (score >= 70) return '#68d391';
  if (score >= 40) return '#f6ad55';
  return '#fc8181';
}
