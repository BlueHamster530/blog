---
title: "[Node.js] 가짜로 진짜처럼 테스트하기: Jest로 시작하는 테스트 코드(Mocking)"
slug: "tistory-62"
description: "안녕하세요. 지난 게시글들을 통해 기본적인 테스트 문법과 비동기 처리 방법을 익혔습니다.하지만 막상 실무 프로젝트에 테스트를 적용하려다 보면 곧바로 벽에 부딪히게 됩니다.'회원가입 테스트를 할 때마다 진짜 이메일이 발송되면 어떡하지?' '결제 로직을 테스트할 때마다 실제 돈이 빠져나가면"
date: 2026-01-20
category: "서버 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/62"
thumbnail: "/blog/images/tistory-62/img1.png"
---


안녕하세요.

지난 게시글들을 통해 기본적인 테스트 문법과 비동기 처리 방법을 익혔습니다.

하지만 막상 실무 프로젝트에 테스트를 적용하려다 보면 곧바로 벽에 부딪히게 됩니다.

"회원가입 테스트를 할 때마다 진짜 이메일이 발송되면 어떡하지?" "결제 로직을 테스트할 때마다 실제 돈이 빠져나가면 안 되는데?" "DB에 들어있는 데이터가 계속 바뀌어서 테스트 결과가 들쭉날쭉해요."

이런 고민을 해결해 주는 것이 **바로 Mocking(모킹)**입니다. 오늘은 테스트 대상이 의존하고 있는 외부 요인을 가짜(Mock)로 대체하여, 내가 작성한 로직만 순수하게 검증하는 방법에 대해 알아보겠습니다.

---

### 1. Mocking이란 무엇인가요?

Mocking은 영화 촬영장의 스턴트 대역이나 세트장과 같습니다.

실제 자동차가 폭발하는 장면을 찍기 위험하니까 모형 자동차를 쓰는 것처럼, 테스트하기 까다로운 실제 객체(DB, 외부 API) 대신 가짜 객체를 투입하는 행위를 말합니다.

Mocking을 사용하면 다음과 같은 이점이 있습니다.

1. **속도:** DB나 네트워크를 타지 않으므로 테스트 속도가 비약적으로 빨라집니다.
2. **안정성:** 외부 API 서버가 점검 중이어도 내 테스트는 항상 통과합니다.
3. **비용 절감:** 문자 발송, 결제 등 실제 비용이 발생하는 로직을 비용 없이 검증할 수 있습니다.

![](/blog/images/tistory-62/img1.png)

---

### 2. jest.fn() : 가짜 함수 만들기

Jest에서 가장 기본이 되는 Mock 함수 생성 도구입니다. 이 가짜 함수는 자신이 몇 번 호출되었는지, 어떤 인자와 함께 호출되었는지를 기억합니다.

```
// 1. 가짜 함수 생성
const mockFn = jest.fn();

// 2. 가짜 함수 실행
mockFn("apple");
mockFn("banana");

// 3. 검증 (Spy 기능)
test('가짜 함수 기록 검증', () => {
  expect(mockFn).toHaveBeenCalledTimes(2); // 두 번 호출되었는가?
  expect(mockFn).toHaveBeenCalledWith("apple"); // "apple"과 함께 호출된 적이 있는가?
});
```

단순히 호출 기록만 보는 것이 아니라, 결과값을 내 마음대로 조작할 수도 있습니다.

```
mockFn.mockReturnValue(100); // 호출되면 무조건 100을 반환해라
console.log(mockFn()); // 100
```

---

### 3. jest.mock() : 모듈 전체를 가짜로 만들기 (실전 예제)

실무에서는 주로 다른 파일에 있는 모듈(Service, Repository 등)을 통째로 가짜로 바꿔치기할 때 사용합니다.

상황을 가정해 보겠습니다. 유저에게 환영 이메일을 보내는 UserService가 있고, 실제로 메일을 발송하는 EmailClient가 있습니다. 우리는 UserService의 로직만 테스트하고 싶고, 실제로 메일이 나가는 것은 원치 않습니다.

**대상 코드**

emailClient.js (외부 의존성)

```
module.exports = {
  sendEmail: (to, text) => {
    // 실제로는 외부 메일 서버와 통신하는 복잡하고 느린 로직
    console.log(`${to}에게 메일 전송: ${text}`);
    return true;
  }
};
```

userService.js (테스트 대상)

```
const emailClient = require('./emailClient');

const sendWelcome = (email) => {
  const message = "가입을 환영합니다!";
  // 외부 모듈 사용
  return emailClient.sendEmail(email, message);
};

module.exports = { sendWelcome };
```

**테스트 코드**

이제 jest.mock을 사용하여 emailClient를 가짜로 바꿔보겠습니다.

userService.test.js

```
const userService = require('./userService');
const emailClient = require('./emailClient');

// 핵심: emailClient 모듈을 통째로 Mocking 합니다.
// 이제 emailClient의 함수들은 실제 로직 대신 가짜 함수(jest.fn)로 대체됩니다.
jest.mock('./emailClient');

describe('유저 서비스 테스트', () => {
  test('유저에게 환영 메일을 발송해야 한다', () => {
    // 1. Mock 설정 (가짜 행동 정의)
    // sendEmail 함수가 호출되면 무조건 true를 반환하도록 조작
    emailClient.sendEmail.mockReturnValue(true);

    // 2. 실행
    const result = userService.sendWelcome('test@test.com');

    // 3. 검증
    // 로직 결과 검증
    expect(result).toBe(true);
    
    // 호출 여부 검증 (실제 메일은 안 나갔지만, 함수가 호출되었는지 확인)
    expect(emailClient.sendEmail).toHaveBeenCalledTimes(1);
    expect(emailClient.sendEmail).toHaveBeenCalledWith(
      'test@test.com',
      '가입을 환영합니다!'
    );
  });
});
```

---

### 4. 비동기 함수 Mocking (mockResolvedValue)

2편에서 다룬 비동기 함수를 Mocking 할 때는 mockReturnValue 대신 mockResolvedValue를 사용해야 합니다. Promise가 해결(resolve)된 값을 반환한다고 명시하는 것입니다.

```
// DB에서 유저를 조회하는 함수를 가짜로 만들 때
userRepository.findById.mockResolvedValue({ 
  id: 1, 
  name: '철수' 
});

// 테스트 실행
const user = await userService.getUser(1);
expect(user.name).toBe('철수');
```

---

### 마치며

3편에 걸쳐 백엔드 테스트를 위한 Jest의 핵심 개념을 알아보았습니다.

**1편:** 테스트의 필요성과 기본 문법 (describe, test, expect)

**2편:** 비동기 처리(async/await)와 테스트 패턴 (SEAT, Lifecycle)

**3편:** 외부 의존성을 격리하는 Mocking

이 3가지 개념만 확실히 잡고 있어도 실무에서 만나는 대부분의 로직을 테스트할 수 있습니다.

처음에는 테스트 코드를 짜는 시간이 개발 시간보다 더 오래 걸리는 것처럼 느껴질 수 있습니다.

하지만 서비스가 커질수록 여러분이 작성한 테스트 코드는 든든한 보험이 되어 돌아올 것입니다.

지금 바로 여러분의 프로젝트에 npm test를 실행해 보세요.
