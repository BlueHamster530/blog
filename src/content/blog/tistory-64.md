---
title: "[Jest] 테스트의 정찰병, Spy(spyOn) 완벽 이해하기 (vs jest.fn)"
slug: "tistory-64"
description: "안녕하세요. 테스트 코드를 작성하다 보면 필연적으로 '가짜(Mock)'를 사용해야 할 때가 옵니다. 그런데 문서를 찾아보면 jest.fn()도 있고 jest.spyOn()도 있어서 도대체 무엇을 써야 할지 헷갈리는 경우가 많습니다. 오늘은 기존 객체를 건드리지 않고 몰래 정보를 빼내거나"
date: 2026-01-21
category: "서버 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/64"
thumbnail: "/blog/images/tistory-64/img1.png"
---


안녕하세요.

테스트 코드를 작성하다 보면 필연적으로 **"가짜(Mock)"**를 사용해야 할 때가 옵니다. 그런데 문서를 찾아보면 jest.fn()도 있고 jest.spyOn()도 있어서 도대체 무엇을 써야 할지 헷갈리는 경우가 많습니다.

오늘은 기존 객체를 건드리지 않고 몰래 정보를 빼내거나 조작하는 **Spy(스파이)**의 개념과, 이를 활용하는 3가지 핵심 패턴에 대해 정리해 보겠습니다.

---

### 1. jest.fn() vs jest.spyOn(): 출발점이 다르다

둘 다 가짜 기능을 수행할 수 있지만, 태생적인 목적이 다릅니다.

#### jest.fn() : 새로운 가짜 로봇 만들기

- **비유:** 아무 기능도 없는 **빈 껍데기 로봇**을 새로 만드는 것입니다.
- **사용처:** 기존에 함수가 없거나, 의존성 주입(DI)을 위해 아예 새로운 가짜 객체를 만들어 던져줄 때 사용합니다.

```javascript
const mockFn = jest.fn(); // 새로운 가짜 함수 생성
```

#### jest.spyOn() : 살아있는 사람에게 도청 장치 심기

- **비유:** 이미 멀쩡히 일하고 있는 **실제 객체(사람)**에게 **몰래 도청 장치(Spy)**를 부착하는 것입니다.
- **사용처:** 이미 존재하는 객체(Math, console, 혹은 내가 만든 Service 객체 등)의 메서드를 감시하거나 잠시만 조작하고 싶을 때 사용합니다.

```javascript
// Math 객체의 random 메서드에 스파이를 심음
const spy = jest.spyOn(Math, 'random');
```

---

### 2. Spy의 3가지 핵심 모드

Spy는 단순히 지켜보는 것뿐만 아니라, 상황에 따라 3가지 모드로 활용할 수 있습니다.

#### ① 감시 모드 (Tracking)

원래 코드는 정상적으로 동작하게 두면서, **"이 함수가 호출되었는가?"**, **"어떤 인자로 호출되었는가?"**만 감시할 때 씁니다.

```javascript
// console.log가 실제로 화면에 찍히게 두면서, 호출 여부만 감시
const logSpy = jest.spyOn(console, 'log');

function myFunc() {
  console.log("일 하는 중...");
}

myFunc(); 

// 화면에는 "일 하는 중..."이 출력됨 (기능 살아있음)
expect(logSpy).toHaveBeenCalled(); // 호출 기록 확인
```

#### ② 변조 모드 (Mocking)

원래 기능이 실행되는 것을 막고, **내가 원하는 가짜 동작**을 하도록 목소리를 변조합니다. 주로 Math.random()이나 Date.now()처럼 실행할 때마다 결과가 바뀌어 테스트하기 힘든 경우, 값을 고정시키기 위해 사용합니다.

```javascript
// 동전 던지기 테스트 상황
const spy = jest.spyOn(Math, 'random');

// 0.5 미만이 나오게 강제 조작 (앞면 상황 연출)
spy.mockReturnValue(0.3);

const result = tossCoin(); // 내부에서 Math.random()이 호출됨
expect(result).toBe('앞면'); // 항상 성공!
```

#### ③ 복구 모드 (Restoration) ★★★

Spy를 사용할 때 가장 중요한 부분입니다. Spy는 **기존 객체**를 건드린 것이기 때문에, 테스트가 끝나면 반드시 **도청 장치를 제거하고 원상복구** 시켜야 합니다.

만약 복구하지 않으면, Math.random()이 계속 0.3만 반환하게 되어 다른 테스트들이 줄줄이 실패하는 **테스트 오염(Test Pollution)**이 발생합니다.

```javascript
afterEach(() => {
  jest.restoreAllMocks(); // 모든 스파이를 철수시키고 원래대로 복구
  // 또는 spy.mockRestore(); // 특정 스파이만 복구
});
```

---

### 3. 활용 예시

백엔드 개발에서 Spy는 **"외부 로직 격리"**에 아주 유용합니다.

**상황:** UserService를 테스트하고 싶은데, 회원가입 시 emailSender.send() 메서드가 호출되어 실제 고객에게 메일이 발송되는 상황.

**해결:** jest.spyOn을 사용하여 emailSender의 send 기능을 잠시 꺼둡니다.

```javascript
// 1. emailSender 객체의 send 메서드에 스파이를 심는다.
const sendSpy = jest.spyOn(emailSender, 'send');

// 2. 실제 발송은 하지 말고, 로그만 찍도록 변조한다. (MockImplementation)
sendSpy.mockImplementation(() => console.log('가짜 이메일 전송됨'));

// 3. 테스트 실행 (실제 메일 안 나감)
userService.register('test@test.com');

// 4. 검증: 메일 보내는 함수가 호출은 되었는가?
expect(sendSpy).toHaveBeenCalledTimes(1);

// 5. 뒷정리 (필수!)
sendSpy.mockRestore();
```

---

### 마치며

jest.spyOn()은 기존 코드의 동작을 보장하면서 필요한 부분만 핀셋처럼 집어내어 테스트할 수 있게 해주는 강력한 도구입니다.

하지만 강력한 만큼 책임도 따릅니다. 스파이를 심었다면(spyOn), 변조하고(mock), 반드시 철수시키는(restore) 과정을 잊지 마세요.

이 3단계만 기억한다면 더 이상 테스트 코드가 꼬이는 일은 없을 것입니다.

![](/blog/images/tistory-64/img1.png)
