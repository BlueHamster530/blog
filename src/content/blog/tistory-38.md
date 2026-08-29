---
title: "[Express] 자식(하위) 라우터에서 부모 req.params가 undefined일 때? mergeParams: true 완벽 정리"
slug: "tistory-38"
description: "안녕하세요! Node.js Express로 REST API를 설계하다 보면, 자연스럽게 중첩된(Nested) 경로를 구성할 때가 많습니다. 예를 들어, 특정 사용자의 게시글을 다루기 위해 /users/:userId/posts와 같은 API를 설계하는 것은 매우 일반적인 패턴입니다. 하지"
date: 2025-11-06
category: "웹 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/38"
---


안녕하세요!

Node.js Express로 REST API를 설계하다 보면, 자연스럽게 중첩된(Nested) 경로를 구성할 때가 많습니다.

예를 들어, **특정 사용자의 게시글**을 다루기 위해 /users/:userId/posts와 같은 API를 설계하는 것은 매우 일반적인 패턴입니다.

하지만 이렇게 부모 라우터(userRouter)에서 자식 라우터(postRouter)로 연결할 때, 많은 분이 당황스러운 문제를 겪게 됩니다. 바로 자식 라우터에서 부모 라우터의 req.params (여기서는 :userId)에 접근할 수 없는 문제죠.

오늘은 이 문제가 왜 발생하는지, 그리고 express.Router({ mergeParams: true }) 옵션이 이 문제를 어떻게 해결하는지 예제 코드와 함께 자세히 알아보겠습니다.

---

### 1. 문제가 발생하는 상황 (The Problem)

먼저, mergeParams 옵션이 **없을 때** 발생하는 문제 상황을 코드로 보겠습니다.

**파일 구조**

```
/routes
  ├─ userRouter.js  (부모 라우터)
  └─ postRouter.js  (자식 라우터)
app.js
```

**app.js (메인 파일)**

```javascript
const express = require('express');
const app = express();
const userRouter = require('./routes/userRouter');

// '/users' 경로로 오는 모든 요청은 userRouter로 보낸다.
app.use('/users', userRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

**routes/userRouter.js (부모 라우터)**

```javascript
const express = require('express');
const router = express.Router();
const postRouter = require('./postRouter');

// '/:userId/posts' 경로로 오는 요청은 postRouter로 넘긴다.
router.use('/:userId/posts', postRouter);

module.exports = router;
```

**routes/postRouter.js (자식 라우터 - ❌ 문제 발생)**

```javascript
const express = require('express');

// ❗ 기본 옵션으로 라우터 생성
const router = express.Router(); 

// GET /users/:userId/posts
router.get('/', (req, res) => {
  // 부모 라우터의 :userId 파라미터를 가져오고 싶다.
  const { userId } = req.params;

  console.log(req.params); // 출력: {} (빈 객체)
  console.log(userId);     // 출력: undefined
  
  res.send(`User ID는 ${userId} 입니다... (undefined가 나옴)`);
});

module.exports = router;
```

GET /users/123/posts로 요청을 보내면, postRouter.js의 req.params에는 {}가 찍히고 userId는 undefined가 됩니다.

---

### 2. 왜 undefined가 나올까?

이유는 **Express 라우터의 기본 동작 방식** 때문입니다.

Express에서 express.Router()로 생성된 라우터는 기본적으로 **독립적인 단위**로 취급됩니다. userRouter가 /:userId/posts 경로에서 postRouter를 사용하도록 연결해 주었지만, postRouter는 **자신에게 연결된 경로 이후의 부분**(/)만 신경 씁니다.

즉, postRouter 입장에서는 부모 라우터가 /:userId라는 파라미터를 가지고 있었다는 사실을 **알지 못합니다.** req.params 객체는 각 라우터마다 고유하게 관리되기 때문입니다.

### 3. 해결책: express.Router({ mergeParams: true })

이 문제를 해결하기 위해 Express는 라우터 생성 시 **{ mergeParams: true }** 옵션을 제공합니다.

이름 그대로 **"파라미터를 병합(Merge)하라"**는 뜻입니다.

이 옵션을 true로 설정하면, Express는 자식 라우터가 부모 라우터의 req.params 값을 **상속받아 자신의 req.params와 병합**하도록 만듭니다.

**routes/postRouter.js (자식 라우터 -  문제 해결)**

JavaScript

```javascript
const express = require('express');

// ❗ mergeParams: true 옵션을 추가!
const router = express.Router({ mergeParams: true }); 

// GET /users/:userId/posts
router.get('/', (req, res) => {
  // 부모 라우터의 :userId 파라미터를 가져올 수 있다!
  const { userId } = req.params;

  console.log(req.params); // 출력: { userId: '123' }
  console.log(userId);     // 출력: '123'
  
  res.send(`성공! User ID는 ${userId} 입니다.`);
});

module.exports = router;
```

이제 다시 GET /users/123/posts로 요청을 보내면, postRouter의 req.params에 { userId: '123' }이 정상적으로 들어오는 것을 확인할 수 있습니다.

**주의:** 이 옵션은 파라미터를 받는 **자식 라우터**(postRouter)에 설정해야 합니다.

---

### 마치며

express.Router({ mergeParams: true })는 중첩된 라우터 구조에서 부모의 URL 파라미터를 자식이 사용해야 할 때 꼭 필요한 옵션입니다.

/users/:userId/posts, /teams/:teamId/members/:memberId처럼 **특정 자원에 종속된 하위 자원**을 다루는 REST API를 설계할 때 이 옵션을 기억해 두신다면, undefined 에러 없이 깔끔한 라우팅 로직을 구현하실 수 있을 겁니다.

감사합니다.
