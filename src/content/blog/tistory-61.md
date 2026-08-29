---
title: "[Node.js] 비동기 처리도 문제없다: Jest로 시작하는 테스트 코드 (비동기와 패턴)"
slug: "tistory-61"
description: "안녕하세요. 지난 게시글에서는 덧셈 함수나 이메일 검증 같은 동기(Synchronous) 코드를 테스트하는 방법을 알아봤습니다. 하지만 Node.js 백엔드 개발의 현실은 조금 다릅니다.데이터베이스에서 유저 정보를 조회하고,외부 API에 요청을 보내고, 파일을 읽고 쓰는 작업 등 대부분"
date: 2026-01-20
category: "서버 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/61"
thumbnail: "/blog/images/tistory-61/img1.png"
---


안녕하세요.

지난 게시글에서는 덧셈 함수나 이메일 검증 같은 동기(Synchronous) 코드를 테스트하는 방법을 알아봤습니다. 하지만 Node.js 백엔드 개발의 현실은 조금 다릅니다.

데이터베이스에서 유저 정보를 조회하고,

외부 API에 요청을 보내고, 파일을 읽고 쓰는 작업 등 대부분의 로직이 **비동기(Asynchronous)**로 동작합니다.

기다림이 필요한 코드를 테스트할 때, 단순히 1편에서 배운 방식대로 작성하면 테스트가 끝나기도 전에 Jest가 종료되거나, 잘못된 결과를 초래할 수 있습니다.

![](/blog/images/tistory-61/img1.png)

오늘은 실제 백엔드 개발에서 필수적인 비동기 코드 테스트 방법과, 테스트 코드를 깔끔하게 관리하는 패턴에 대해 알아보겠습니다.

---

### 1. 비동기 코드를 테스트하는 방법

비동기 함수는 실행 즉시 결과가 나오지 않고, 일정 시간이 지난 뒤에 완료됩니다.

Jest에게 이 테스트가 비동기 작업임을 알려주지 않으면, Jest는 검증(expect) 단계가 실행되기도 전에 테스트를 성공으로 처리하고 끝내버립니다.

이를 해결하는 두 가지 방법이 있습니다.

#### 방법 1: 콜백 방식 (done) - 레거시 이해하기

과거에는 콜백 함수를 많이 사용했습니다. Jest는 test 함수의 인자로 done이라는 콜백을 제공합니다. 비동기 로직이 끝나는 시점에 done()을 직접 호출해주면, Jest는 그때까지 테스트 종료를 기다립니다.

```javascript
test('3초 후에 데이터를 받아온다', (done) => {
  setTimeout(() => {
    try {
      expect(1 + 1).toBe(2);
      done(); // 테스트가 끝났음을 알림
    } catch (error) {
      done(error); // 에러가 발생하면 실패 처리
    }
  }, 3000);
});
```

이 방식은 콜백 지옥과 마찬가지로 코드가 복잡해질 수 있어 최근에는 잘 사용하지 않지만, 레거시 코드를 다룰 때를 위해 알아두면 좋습니다.

#### 방법 2: Async / Await - 최신 트렌드

현대적인 JavaScript 개발에서는 대부분 async/await를 사용합니다. Jest 역시 이를 완벽하게 지원합니다. 테스트 함수 앞에 async를 붙이고, 비동기 로직 앞에 await를 붙이면 동기 코드처럼 직관적으로 테스트할 수 있습니다.

가짜 데이터베이스 조회 함수를 만들어서 테스트해 보겠습니다.

```javascript
// 가짜 DB 조회 함수
const fetchUser = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: id, name: '철수' });
    }, 100);
  });
};

// 테스트 코드
test('사용자 정보를 조회한다', async () => {
  const data = await fetchUser(1); // 데이터가 올 때까지 기다림
  expect(data.name).toBe('철수');
});
```

훨씬 깔끔하고 읽기 쉽습니다. 실무에서는 대부분 이 방식을 사용합니다.

![](/blog/images/tistory-61/img2.png)

---

### 2. 테스트의 생명주기 (Lifecycle Hooks)

테스트 파일 하나에 수십 개의 테스트 케이스가 있다고 가정해 봅시다. 모든 테스트마다 DB에 연결하고, 테스트가 끝나면 연결을 끊어야 한다면 코드가 매우 중복될 것입니다.

Jest는 테스트 실행 전후에 공통된 작업을 처리할 수 있도록 훅(Hook) 함수들을 제공합니다.

![](/blog/images/tistory-61/img3.png)

- **beforeAll**: 모든 테스트가 시작되기 전, 딱 한 번 실행됩니다. (예: DB 연결, 테스트 서버 실행)
- **afterAll**: 모든 테스트가 끝난 후, 딱 한 번 실행됩니다. (예: DB 연결 종료)
- **beforeEach**: 각 테스트(it, test)가 실행되기 직전에 매번 실행됩니다. (예: 테스트 데이터 생성, 변수 초기화)
- **afterEach**: 각 테스트가 끝난 직후 매번 실행됩니다. (예: 테스트 데이터 삭제/롤백)

```javascript
describe('데이터베이스 관련 테스트', () => {
  beforeAll(() => {
    console.log('DB에 연결합니다.');
  });

  afterAll(() => {
    console.log('DB 연결을 끊습니다.');
  });

  beforeEach(() => {
    console.log('다음 테스트를 위해 테이블을 비웁니다.');
  });

  test('데이터 삽입 테스트', async () => {
    // ...
  });

  test('데이터 조회 테스트', async () => {
    // ...
  });
});
```

---

### 3. 테스트 코드의 4단계 패턴 (SEAT)

좋은 테스트 코드는 그 자체로 문서 역할을 해야 합니다. 이를 위해 **SEAT 패턴** (또는 AAA 패턴: Arrange-Act-Assert)을 기억하면 좋습니다. 테스트 코드를 구조화하는 표준적인 방법입니다.

![](/blog/images/tistory-61/img4.png)

1. **Setup (준비/Arrange):** 테스트에 필요한 데이터나 환경을 준비합니다.
2. **Exercise (실행/Act):** 실제로 테스트할 함수나 API를 실행합니다.
3. **Assertion (검증/Assert):** 실행 결과가 기대한 값과 일치하는지 확인합니다.
4. **Teardown (정리):** (선택) 테스트로 인해 변경된 상태를 원래대로 되돌립니다.

```javascript
test('유저의 나이를 수정할 수 있다', () => {
  // 1. Setup (준비)
  const user = { id: 1, name: '영희', age: 20 };
  const newAge = 25;

  // 2. Exercise (실행)
  user.age = newAge; // 실제로는 updateUser(user, newAge) 같은 함수 호출

  // 3. Assertion (검증)
  expect(user.age).toBe(25);
  
  // 4. Teardown (정리)
  // 보통 afterEach에서 처리하거나, 메모리 상의 변수라면 생략 가능
});
```

이렇게 단계를 주석으로 구분하거나 빈 줄로 띄워주면, 다른 동료가 코드를 봤을 때 "아, 여기서 준비하고 여기서 실행했구나"를 한눈에 파악할 수 있습니다.

---

### 마치며

오늘은 비동기 코드를 async/await로 깔끔하게 테스트하는 방법과, before/after 훅을 이용해 테스트 환경을 관리하는 법, 그리고 SEAT 패턴으로 코드를 구조화하는 법을 알아보았습니다.

하지만 아직 해결하지 못한 큰 문제가 하나 있습니다. "진짜 DB에 연결해서 테스트하면 데이터가 꼬이지 않을까요?", "외부 API가 점검 중이면 테스트가 실패하나요?"

이런 외부 의존성 문제를 해결하기 위해 다음 3편에서는 테스트의 꽃이라 불리는 **모킹(Mocking)**에 대해 다뤄보겠습니다.
