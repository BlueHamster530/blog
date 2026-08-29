---
title: "[Node.js] 백엔드 개발자의 안전장치: Jest로 시작하는 테스트 코드 (기초)"
slug: "tistory-60"
description: "안녕하세요. 백엔드 API를 개발하다 보면 필연적으로 마주치는 상황이 있습니다. 기능을 하나 만들고 나서 Postman을 켜고, 로그인 토큰을 넣고, 요청을 보내서 응답이 제대로 오는지 확인하는 과정입니다. 더 큰 문제는 코드를 수정할 때입니다. 기능 개선을 위해 코드 한 줄을 고쳤을 "
date: 2026-01-20
category: "서버 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/60"
thumbnail: "/blog/images/tistory-60/img1.png"
---


안녕하세요.

백엔드 API를 개발하다 보면 필연적으로 마주치는 상황이 있습니다. 기능을 하나 만들고 나서 Postman을 켜고, 로그인 토큰을 넣고, 요청을 보내서 응답이 제대로 오는지 확인하는 과정입니다.

더 큰 문제는 코드를 수정할 때입니다. 기능 개선을 위해 코드 한 줄을 고쳤을 뿐인데, 잘 되던 다른 기능이 갑자기 멈추지 않을까 불안해하며 다시 모든 API를 일일이 찔러봐야 했던 경험, 다들 한 번쯤 있으실 겁니다.

이런 반복적인 수동 노동과 수정에 대한 막연한 두려움을 없애주는 것이 바로 테스트 코드입니다.

오늘은 Node.js 환경에서 가장 널리 쓰이는 테스트 프레임워크인 Jest를 사용하여 테스트의 세계에 입문해 보겠습니다.

---

### 1. 왜 테스트 코드를 작성해야 할까요?

테스트 코드, 특히 유닛 테스트(Unit Test)는 내 로직을 보호하는 안전장치와 같습니다.

개발자가 작성한 코드가 의도한 대로 동작하는지 검증하는 또 다른 코드를 작성하는 것입니다. 이를 통해 얻을 수 있는 이점은 명확합니다.

첫째, 리팩토링의 두려움이 사라집니다.

 코드를 구조적으로 개선하더라도 테스트 코드를 돌려 통과한다면 기능에 문제가 없음을 확신할 수 있습니다.

둘째, 문서 역할을 합니다.

 테스트 코드를 보면 이 함수가 어떤 입력값을 받아 어떤 결과를 내야 하는지 명확하게 알 수 있습니다.

셋째, 버그를 조기에 발견합니다.

 배포 후에 사용자가 발견할 버그를 개발 단계에서 미리 잡을 수 있습니다.

![](/blog/images/tistory-60/img1.png)

---

### 2. Jest 환경 설정하기

Jest는 설정이 간편하고 기능이 강력하여 사실상 Node.js 진영의 표준 테스트 라이브러리입니다. 프로젝트에 Jest를 설치하는 것부터 시작해 보겠습니다.

먼저 터미널에서 다음 명령어를 입력하여 Jest를 개발 의존성으로 설치합니다.

```
npm install --save-dev jest
```

(TypeScript를 사용하신다면 ts-jest와 @types/jest도 함께 설치해야 합니다.)

설치가 완료되었다면 package.json 파일을 열어 scripts 부분에 test 명령어를 추가합니다.

```
{
  "scripts": {
    "test": "jest"
  }
}
```

이제 터미널에서 npm test라고 입력하면 Jest가 프로젝트 내의 테스트 파일(\*.test.js 또는 \*.spec.js)을 찾아 자동으로 실행하게 됩니다.

---

### 3. Jest 기본 문법 익히기

Jest의 테스트 코드는 크게 3가지 요소로 구성됩니다.

1. describe: 관련된 테스트들을 그룹화하는 블록입니다.
2. test (또는 it): 개별 테스트 케이스를 정의합니다.
3. expect: 검증할 대상을 지정하고 Matcher를 통해 기대하는 값과 비교합니다.

```
describe('계산기 테스트 그룹', () => {
  test('1 더하기 2는 3이어야 한다', () => {
    expect(1 + 2).toBe(3);
  });
});
```

사람이 읽는 문장처럼 자연스럽게 읽히는 것이 특징입니다.

"계산기 테스트 그룹에서(describe), 1 더하기 2는 3이어야 한다(test)고 기대한다(expect)."

![](/blog/images/tistory-60/img2.png)

---

### 4. 자주 쓰는 검증 도구 (Matcher)

expect() 뒤에 붙여서 값을 비교하는 메서드를 Matcher라고 부릅니다. 상황에 따라 다양한 Matcher를 사용해야 정확한 테스트가 가능합니다.

![](/blog/images/tistory-60/img3.png)

#### toBe()

단순한 값(숫자, 문자열, 불리언 등)의 일치를 확인할 때 사용합니다.

```
expect(10).toBe(10);
expect("hello").toBe("hello");
```

#### toEqual()

객체(Object)나 배열(Array)의 내용이 같은지 확인할 때 사용합니다. 객체는 참조값이 다르기 때문에 toBe를 쓰면 실패할 수 있습니다.

```
const user = { name: "철수", age: 20 };
expect(user).toEqual({ name: "철수", age: 20 });
```

#### toBeTruthy(), toBeFalsy()

값이 true 또는 false로 취급되는지 확인합니다.

```
expect(1).toBeTruthy();
expect(0).toBeFalsy();
expect(null).toBeFalsy();
```

#### toThrow()

함수가 에러를 제대로 던지는지 확인할 때 사용합니다. 예외 처리가 잘 되어 있는지 검증할 때 필수적입니다.

```
const bomb = () => {
  throw new Error("펑!");
};
expect(() => bomb()).toThrow();
```

---

### 5. 실습: 간단한 유효성 검사 함수 테스트

배운 내용을 바탕으로 간단한 회원가입 유효성 검사 함수를 만들고 테스트해 보겠습니다.

**검증 대상 코드 (validator.js)**

```
function isValidEmail(email) {
  if (!email) return false;
  if (!email.includes("@")) return false;
  return true;
}

module.exports = { isValidEmail };
```

**테스트 코드 (validator.test.js)**

```
const { isValidEmail } = require('./validator');

describe('이메일 유효성 검사', () => {
  test('이메일에 @가 포함되면 true를 반환한다', () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  test('이메일이 비어있으면 false를 반환한다', () => {
    expect(isValidEmail("")).toBe(false);
  });

  test('이메일에 @가 없으면 false를 반환한다', () => {
    expect(isValidEmail("testexample.com")).toBe(false);
  });
});
```

이제 npm test를 실행하면 초록색 글씨로 PASS가 뜨는 것을 확인할 수 있습니다.

![](/blog/images/tistory-60/img4.png)

---

### 마치며

오늘은 테스트의 필요성과 Jest의 가장 기초적인 사용법에 대해 알아보았습니다.

아직은 단순한 함수만 테스트했지만, 이 기초가 쌓여 복잡한 API와 비즈니스 로직을 검증하는 기반이 됩니다. 다음 편에서는 데이터베이스 연결 등 외부 의존성을 가짜로 대체하는 **Mocking**과 API 전체를 테스트하는 방법에 대해 알아보겠습니다.
