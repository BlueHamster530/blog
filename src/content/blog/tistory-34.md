---
title: "[Node.js / Express] 헷갈리는 app.use()와 app.all() - 차이점과 사용 예시"
slug: "tistory-34"
description: "안녕하세요! Node.js Express 프레임워크로 서버를 개발하다 보면 app.use()와 app.all()을 만나게 됩니다. 두 메서드 모두 '모든'이라는 뉘앙스를 풍겨서 그 차이에 대해 명확하게 기록하고자 글을 작성해 봅니다. 이 둘은 경로 일치 방식과 주요 사용 목적에서 명확한"
date: 2025-10-31
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/34"
---


안녕하세요!

Node.js Express 프레임워크로 서버를 개발하다 보면 app.use()와 app.all()을 만나게 됩니다. 두 메서드 모두 '모든'이라는 뉘앙스를 풍겨서 그 차이에 대해 명확하게 기록하고자 글을 작성해 봅니다.

이 둘은 **경로 일치 방식**과 **주요 사용 목적**에서 명확한 차이를 가집니다.

오늘은 app.use()와 app.all()이 각각 무엇이며, 어떤 상황에서 사용해야 하는지 예제 코드와 함께 확실하게 알아보겠습니다!

## 1. app.use([경로], 콜백) - 미들웨어(Middleware) 등록

app.use()는 Express의 핵심 기능인 **미들웨어(Middleware)** 를 애플리케이션에 등록할 때 사용합니다.

미들웨어는 요청(Request)이 라우터(경로 처리기)에 도달하기 전, 혹은 응답(Response)이 클라이언트에게 전송되기 전에 실행되는 **중간 처리 함수**입니다.

### app.use()의 핵심 특징

- **느슨한 경로 일치:** app.use()에 지정된 경로는 해당 경로로 **'시작하는'** 모든 요청에 대해 실행됩니다.
  - 예: app.use('/admin', ...)은 /admin, /admin/users, /admin/posts/123 등 /admin으로 시작하는 모든 경로에서 동작합니다.
- **메소드 무관:** GET, POST, PUT, DELETE 등 HTTP 메소드와 **상관없이** 무조건 실행됩니다.
- **주요 용도:** 애플리케이션 전반에 걸친 공통 로직 처리에 사용됩니다.
  - 모든 요청에 대한 로그(Logger) 남기기
  - req.body 파싱 (express.json(), express.urlencoded())
  - 정적 파일(css, js, image) 제공 (express.static)
  - 세션 또는 인증(Authentication) 초기화

### app.use() 예시 코드

JavaScript

```
const express = require('express');
const app = express();

// 1. 모든 요청에 대해 실행되는 미들웨어 (경로 생략 시 '*')
app.use((req, res, next) => {
  console.log(`[${new Date()}] ${req.method} ${req.path}`);
  next(); // 반드시 next()를 호출해야 다음 미들웨어나 라우터로 넘어갑니다.
});

// 2. '/api'로 시작하는 모든 요청에 대해 실행되는 미들웨어
app.use('/api', (req, res, next) => {
  console.log('API 요청 인증 확인...');
  // (인증 로직)
  next();
});

// 3. 내장 미들웨어 사용 예시
app.use(express.json()); // JSON 바디 파서
app.use('/static', express.static('public')); // 정적 파일 제공

app.get('/', (req, res) => {
  res.send('메인 페이지');
});

app.get('/api/users', (req, res) => {
  res.send('사용자 목록');
});

app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});
```

---

## 2. app.all(경로, 콜백) - 모든 메소드 라우팅(Routing)

app.all()은 app.get(), app.post()와 같은 **라우팅 메소드** 중 하나입니다.

이름(all) 그대로, 특정 경로에 대해 **모든 HTTP 메소드(GET, POST, PUT, DELETE 등)** 의 요청을 받아 처리하는 라우터를 등록할 때 사용합니다.

### app.all()의 핵심 특징

- **엄격한 경로 일치:** app.all()에 지정된 경로는 해당 경로와 **'정확히 일치하는'** 요청에 대해서만 실행됩니다. (라우팅 파라미터는 예외)
  - 예: app.all('/admin', ...)은 오직 /admin 경로에서만 동작합니다. /admin/users에서는 동작하지 않습니다.
- **모든 메소드 처리:** GET, POST 등 모든 HTTP 메소드 요청에 반응합니다.
- **주요 용도:** 특정 라우트에 대해, 메소드와 상관없이 공통으로 처리해야 할 작업(예: 해당 라우트의 세부 권한 확인)이 있을 때 유용합니다.

### app.all() 예시 코드

JavaScript

```
const express = require('express');
const app = express();

// '/user/profile' 경로로 오는 *모든 메소드*의 요청에 대해
// 공통적으로 '특정 권한'을 확인하는 미들웨어를 먼저 실행
app.all('/user/profile', (req, res, next) => {
  console.log('/user/profile 경로에 대한 공통 권한 확인');
  // if (!hasPermission(req)) {
  //   return res.status(403).send('권한이 없습니다.');
  // }
  next(); // 권한 통과 시 다음 라우터로
});

// 개별 메소드 라우팅
app.get('/user/profile', (req, res) => {
  res.send('프로필 조회 (GET)');
});

app.post('/user/profile', (req, res) => {
  res.send('프로필 수정 (POST)');
});

// '/admin' 경로는 app.all()의 영향을 받지 않음
app.get('/admin', (req, res) => {
  res.send('관리자 페이지');
});

app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});
```

---

## 3. 핵심 요약: app.use() vs app.all()

두 기능의 차이점을 표로 간단히 정리해 보겠습니다.

|  |  |  |
| --- | --- | --- |
| **구분** | **app.use() (미들웨어)** | **app.all() (라우팅)** |
|  |  |  |
| --- | --- | --- |
| **목적** | 애플리케이션에 **미들웨어** 적용 | 특정 라우트에 대한 **핸들러** 등록 |
| **경로 일치** | **느슨함** (/path로 \*\*'시작'\*\*하는 모든 경로) | **엄격함** (/path와 \*\*'정확히 일치'\*\*하는 경로) |
| **메소드** | 모든 메소드 (메소드 구분 없음) | 모든 메소드 (메소드 와일드카드 \*) |
| **주요 사용** | 로깅, express.json(), express.static, 인증 초기화 | 특정 라우트의 공통 인증/권한 체크 |

## 마치며

결론적으로,

- app.use()는 **애플리케이션 전반** 혹은 **특정 경로 하위 전체**에 적용되는 \*\*공통 기능(미들웨어)\*\*을 등록할 때 사용합니다.
- app.all()은 **특정 경로 하나**에 대해 **모든 HTTP 메소드**를 한 번에 처리하는 **라우팅**이 필요할 때 사용합니다.

이 둘의 가장 큰 차이인 **'경로 일치 방식(느슨함 vs 엄격함)'**을 명확히 이해한다면, Express의 라우팅과 미들웨어를 훨씬 더 유연하고 효과적으로 설계할 수 있을 것입니다.

감사합니다.
