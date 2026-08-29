---
title: "[Prisma] DB 쿼리 속도가 느리다면? @@index로 성능 최적화하기"
slug: "tistory-39"
description: "서비스를 개발하다 보면 데이터가 적을 때는 빨랐던 API가, 데이터가 쌓일수록 점점 느려지는 경험을 하게 됩니다. 이때 가장 먼저 확인해야 할 것이 바로 데이터베이스 인덱싱(Indexing)입니다. 오늘은 Prisma 스키마에서 @@index를 사용하여 쿼리 성능을 획기적으로 높이는 방"
date: 2025-11-14
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/39"
---


서비스를 개발하다 보면 데이터가 적을 때는 빨랐던 API가, 데이터가 쌓일수록 점점 느려지는 경험을 하게 됩니다. 이때 가장 먼저 확인해야 할 것이 바로 **데이터베이스 인덱싱(Indexing)**입니다.

오늘은 Prisma 스키마에서 @@index를 사용하여 쿼리 성능을 획기적으로 높이는 방법과, 제가 작업중인 프로젝트 코드(ExerciseRecord)를 통해 그 원리를 분석해 보겠습니다.

---

## 1. 인덱스(Index)란 무엇인가?

인덱스는 말 그대로 데이터베이스의 **'색인'**입니다. 두꺼운 전공 서적의 맨 뒷장에 있는 '찾아보기'와 똑같은 역할을 합니다.

- **인덱스가 없을 때 (Full Table Scan):** 책에서 특정 단어를 찾기 위해 **첫 페이지부터 끝 페이지까지** 한 줄씩 다 읽어야 합니다. 데이터가 많을수록 매우 느려집니다.
- **인덱스가 있을 때 (Index Scan):** 책 뒤의 '찾아보기'를 통해 해당 단어가 있는 페이지로 **바로 이동**합니다. 데이터가 아무리 많아도 순식간에 찾을 수 있습니다.

Prisma에서는 모델 아래에 @@index를 추가하는 것만으로 이 강력한 기능을 사용할 수 있습니다.

---

## 2. 실제 코드 분석: 운동 기록 모델

다음은 운동 기록을 저장하는 ExerciseRecord 모델입니다. 3개의 인덱스가 설정되어 있는데, 각각의 역할이 무엇인지 살펴보겠습니다.

```
model ExerciseRecord {
  id            Int          @id @default(autoincrement())
  exercisetype  exerciseType
  description   String?
  playtime      Int
  distance      Float
  images        String[]
  password      String
  
  // 관계 설정
  participantId Int
  participant   Participant  @relation(fields: [participantId], references: [id], onDelete: Cascade)
  groupId       Int
  group         Group        @relation(fields: [groupId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // 🚀 성능 최적화를 위한 인덱스 설정
  @@index([groupId])                // 1번
  @@index([participantId])          // 2번
  @@index([groupId, createdAt])     // 3번
}
```

### 1) 단일 컬럼 인덱스: @@index([groupId])

- **목적:** 특정 그룹의 데이터를 빠르게 찾기 위함
- **언제 효과적인가?:** where 절에 groupId를 조건으로 걸 때입니다.
- JavaScript

  ```
  // "1번 그룹의 모든 운동 기록을 가져와라"
  prisma.exerciseRecord.findMany({
      where: { groupId: 1 } 
  });
  ```
- 이 인덱스가 없다면, DB는 1번 그룹의 글을 찾기 위해 전체 테이블을 다 뒤져야 합니다. 하지만 인덱스가 있으면 1번 그룹 데이터가 모여 있는 곳을 바로 가리킵니다. JOIN 연산 시에도 필수적입니다.

### 2) 단일 컬럼 인덱스: @@index([participantId])

- **목적:** 특정 사용자의 데이터를 빠르게 찾기 위함
- **언제 효과적인가?:** 마이페이지 등에서 "내가 쓴 글"을 조회할 때 사용됩니다.
- JavaScript

  ```
  // "철수가 쓴 기록만 다 가져와라"
  prisma.exerciseRecord.findMany({
      where: { participantId: user.id }
  });
  ```

### 3) 복합 인덱스 (Composite Index): @@index([groupId, createdAt])

이것이 가장 중요한 **핵심**입니다. 두 개의 컬럼을 묶어서 인덱스를 걸었습니다.

- **목적:** **"특정 그룹"의 글을 "최신순"**으로 정렬해서 가져오기 위함
- **언제 효과적인가?:** 게시판 목록 조회처럼 필터링과 정렬이 동시에 일어날 때입니다.
- JavaScript

  ```
  prisma.exerciseRecord.findMany({
      where: { groupId: 10 },        // 1. 그룹으로 추리고
      orderBy: { createdAt: 'desc' } // 2. 날짜순으로 정렬
  });
  ```

**왜 이게 중요할까요?** 만약 [groupId] 인덱스만 있다면, DB는 10번 그룹의 데이터를 빠르게 찾을 수는 있습니다. 하지만 찾은 데이터를 다시 메모리에 올려서 날짜별로 정렬(Sorting)하는 추가 작업(Filesort)을 해야 합니다.

하지만 [groupId, createdAt]으로 복합 인덱스를 걸어두면, **데이터베이스는 이미 그룹별로, 그리고 그 안에서 날짜별로 예쁘게 정렬된 색인표를 가지고 있게 됩니다.** DB는 별도의 정렬 작업 없이 그냥 색인표 순서대로 데이터를 가져오기만 하면 됩니다. 쿼리 속도가 압도적으로 빨라집니다.

---

## 3. 요약 및 적용 팁

Prisma를 사용할 때 다음 상황이라면 반드시 @@index를 고려하세요.

1. **where 조건절에 자주 등장하는 컬럼** (예: 외래 키 groupId, userId)
2. **orderBy 정렬 기준으로 자주 쓰이는 컬럼** (예: createdAt, likes)
3. **필터링과 정렬을 동시에 수행하는 경우** (복합 인덱스 활용)

인덱스는 조회 속도를 획기적으로 높여주지만, 반대로 데이터를 생성(create)하거나 수정(update)할 때는 색인표도 같이 수정해야 하므로 쓰기 속도가 아주 미세하게 느려질 수 있습니다. 따라서 **조회가 빈번하게 일어나는 컬럼** 위주로 전략적으로 설정하는 것이 중요합니다.

이 글이 Prisma 성능 최적화에 도움이 되기를 바랍니다!
