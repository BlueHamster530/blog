---
title: "왜 SQL 대신 ORM을 쓸까 — 직접 쿼리 짜기와의 진짜 차이"
slug: "why-use-orm"
description: "DB를 직접 SQL로 다루는 것과 ORM을 쓰는 것의 차이, ORM이 주는 진짜 장점과 트레이드오프를 TypeScript/Prisma 코드 비교로 설명합니다."
tags: [ORM, 데이터베이스, 백엔드, Prisma, 설계]
category: "백엔드"
date: 2026-07-10
platforms: [Notion, Tistory]
thumbnail: "/blog/images/why-use-orm/hero.png"
---


> 🧩 "그냥 SQL 짜면 되는데 왜 굳이 ORM을 배워야 하나요?"
> 신입 때 한 번쯤 드는 의문입니다. 결론부터 말하면, ORM은 편의 도구가 아니라 **설계 방식**에 가깝습니다.
> (예제는 Node.js + TypeScript + Prisma 5 기준입니다. C# 진영은 Entity Framework Core가 같은 역할을 합니다.)

## ORM이 뭔가요

**ORM(Object-Relational Mapping)**은 객체지향 프로그래밍의 "객체"와 관계형 데이터베이스의 "테이블/행"을 자동으로 이어주는 기술입니다. 대표적으로 Node/TypeScript의 Prisma·TypeORM, C#/.NET의 Entity Framework Core, 자바의 JPA/Hibernate 등이 있어요.

핵심은 이겁니다. **"SQL 문자열을 직접 쓰는 대신, 내가 다루는 객체를 통해 DB와 대화한다."**

```mermaid
graph LR
    A[User 객체] -->|ORM이 변환| B[(users 테이블)]
    B -->|ORM이 변환| A
```

![hero](/blog/images/why-use-orm/hero.png)

## 직접 SQL을 쓰면 이렇게 됩니다

```sql
SELECT id, name, email FROM users WHERE id = 1;
```

```typescript
// node-postgres(pg)로 직접 쿼리 + 수동 매핑
const result = await pool.query(
  "SELECT id, name, email FROM users WHERE id = $1",
  [1]
);
const row = result.rows[0];
const user: User = { id: row.id, name: row.name, email: row.email };
```

기능은 잘 돌아갑니다. 하지만 테이블 컬럼이 하나 추가되거나, 조인이 복잡해지거나, DB 종류가 바뀌면 이 **매핑 코드를 사람이 손으로 계속 관리**해야 합니다.

## ORM을 쓰면 이렇게 됩니다

```typescript
// Prisma
const user = await prisma.user.findUnique({ where: { id: 1 } });
```

```prisma
// schema.prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

객체(모델)와 테이블 구조를 한 번 매핑해두면, 이후로는 SQL을 직접 쓰지 않고 **객체를 다루듯** 데이터를 조회·저장·수정할 수 있습니다. 게다가 Prisma는 `schema.prisma`를 기준으로 TypeScript 타입을 자동 생성해서, `user.name`을 잘못된 타입으로 쓰면 컴파일 시점에 바로 에러가 납니다.

## ORM의 진짜 장점 4가지

1. **생산성**: 반복적인 CRUD 매핑 코드를 직접 짜지 않아도 됩니다. 컬럼 하나 추가돼도 스키마 파일만 고치면 끝.
2. **객체지향 설계 유지**: SQL 없이도 객체 간 관계(1:N, N:M)를 코드로 자연스럽게 표현할 수 있습니다. DB 구조에 코드가 끌려다니지 않습니다.
3. **DB 벤더 독립성**: SQL 문법은 DB마다 조금씩 다른데, ORM은 이 차이를 추상화해줘서 MySQL → PostgreSQL 전환 같은 상황에도 코드 변경이 최소화됩니다.
4. **안전성**: 문자열을 직접 이어붙여 쿼리를 만들지 않으므로 **SQL 인젝션** 같은 실수를 구조적으로 줄여줍니다.

![tips](/blog/images/why-use-orm/tips.png)

## 안티패턴 vs 권장 패턴 — N+1 문제

ORM을 쓰면서 가장 자주 걸려 넘어지는 함정이 **N+1 쿼리 문제**입니다.

```typescript
// ❌ 안티패턴: 게시글 100개를 조회하면서, 각 게시글의 작성자를 반복문 안에서 따로 조회
const posts = await prisma.post.findMany(); // 쿼리 1번
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
  // 게시글이 100개면 쿼리가 101번(1 + N) 나감
}
```

```typescript
// ✅ 권장 패턴: 관계를 한 번에 함께 조회(eager loading)
const posts = await prisma.post.findMany({
  include: { author: true },
}); // 쿼리 1~2번으로 끝
```

N+1 문제는 겉보기엔 코드가 짧고 자연스러워서 리뷰에서도 놓치기 쉽지만, 게시글이 100개면 실제로 **데이터베이스 왕복이 101번** 일어납니다. 일반적으로 쿼리 수가 늘어날수록 네트워크 왕복(round-trip) 비용이 누적되는 경향이 있어, 목록 조회 API에서 응답 지연의 흔한 원인으로 꼽힙니다. `include`(Prisma) / `JOIN FETCH`(JPA) / `Include()`(EF Core)처럼 **연관 데이터를 미리 함께 가져오는 옵션**을 쓰는 게 표준적인 해결책입니다.

## 그럼 ORM이 무조건 좋은가요? — 트레이드오프

| 상황 | 직접 SQL | ORM |
| --- | --- | --- |
| 단순 CRUD가 많은 일반 서비스 로직 | 매핑 코드 반복 작성 부담 | 적합 — 생산성 이득이 큼 |
| 복잡한 통계/집계 리포트 쿼리 | 자유롭고 명확 | ORM 문법으로 억지로 표현하면 오히려 가독성이 떨어질 수 있음 |
| DB 벤더를 자주 바꾸는 프로젝트 | 매번 SQL 수정 필요 | 적합 — 추상화 계층이 흡수 |
| 극한의 쿼리 성능 튜닝이 필요한 구간 | 실행 계획을 세밀히 제어 가능 | ORM이 생성하는 쿼리를 신뢰하기 어려울 수 있어 네이티브 쿼리 병행 필요 |

판단 기준은 이렇습니다: **팀 대부분의 쿼리가 단순 CRUD라면 ORM을 기본으로 가져가고, 복잡한 집계·리포트성 쿼리만 예외적으로 네이티브 SQL(또는 QueryDSL 같은 보조 도구)을 섞어 쓰는 것**이 일반적인 실무 패턴으로 알려져 있습니다. ORM은 SQL을 몰라도 되게 해주는 도구가 아니라, **SQL을 알면서도 반복 작업을 줄여주는 도구**로 이해하는 게 정확합니다.

## 흔한 오해 바로잡기

1. **"ORM을 쓰면 SQL을 몰라도 된다"** — 아닙니다. ORM이 생성하는 쿼리가 비효율적일 때 이를 진단하려면 결국 SQL과 실행 계획을 읽을 줄 알아야 합니다.
2. **"ORM은 항상 SQL보다 느리다"** — 항상 그렇진 않습니다. N+1처럼 잘못 쓰면 느려지지만, 올바르게 쓰면 직접 짠 SQL과 성능 차이가 미미한 경우도 많습니다. 성능은 "ORM이냐 아니냐"보다 "쿼리를 어떻게 짰느냐"에 더 크게 좌우된다고 알려져 있습니다.
3. **"모든 쿼리를 ORM으로만 짜야 한다"** — 아닙니다. 대부분의 ORM은 네이티브 SQL을 섞어 쓰는 탈출구(Prisma의 `$queryRaw`, JPA의 `nativeQuery` 등)를 제공합니다. 복잡한 쿼리에는 이 탈출구를 쓰는 게 오히려 권장됩니다.

## 셀프 체크 질문

1. N+1 문제가 왜 발생하는지, 그리고 어떻게 예방하는지 설명할 수 있나요?
2. ORM이 SQL 인젝션 위험을 구조적으로 줄여주는 이유는 무엇인가요?
3. "ORM은 항상 SQL을 몰라도 되게 해준다"는 말이 왜 틀렸는지 설명할 수 있나요?

:::toggle 정답 보기
1. 목록을 조회한 뒤 각 항목의 연관 데이터를 반복문 안에서 개별 조회하면, 목록 조회 1번 + 항목 수만큼(N) 추가 쿼리가 발생합니다. `include`/`JOIN FETCH` 같은 즉시 로딩(eager loading) 옵션으로 연관 데이터를 한 번에 함께 조회하면 예방할 수 있습니다.
2. ORM은 문자열을 직접 이어붙이는 대신, 파라미터를 바인딩하는 방식(prepared statement)으로 쿼리를 생성합니다. 사용자 입력이 SQL 문법으로 해석되지 않고 값으로만 취급되기 때문에 인젝션 위험이 구조적으로 줄어듭니다.
3. ORM은 반복적인 매핑 코드를 줄여줄 뿐, 쿼리 성능 문제를 진단하거나 복잡한 집계 쿼리를 최적화하려면 여전히 SQL과 실행 계획을 이해해야 합니다.
:::

## 더 깊이 파고들기

- [Prisma 공식 문서](https://www.prisma.io/docs) — 스키마 정의부터 쿼리 API까지 실습 예제가 잘 정리돼 있습니다.
- [Entity Framework Core 공식 문서](https://learn.microsoft.com/en-us/ef/core/) — C#/.NET 진영에서 같은 개념이 어떻게 구현되는지 비교해보기 좋습니다.

## 마치며

ORM을 쓰는 이유는 "SQL이 어려워서"가 아니라, **객체지향 설계를 유지하면서 반복 작업과 실수를 줄이기 위해서**입니다. 신입이라면 우선 ORM으로 기본 CRUD에 익숙해진 다음, N+1 문제나 지연 로딩 같은 내부 동작을 하나씩 파보는 순서를 추천합니다. 도구를 잘 쓰려면 그 도구가 뭘 대신해주고 있는지부터 아는 게 먼저니까요. 🧩
