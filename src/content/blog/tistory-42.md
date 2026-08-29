---
title: "[Node.js] Express에서 반복되는 try-catch 문 없애기: 비동기 에러 핸들링 래퍼 함수 (catchAsync)"
slug: "tistory-42"
description: "안녕하세요.Node.js의 Express 프레임워크를 사용하여 백엔드 서버를 개발하다 보면, 비동기 처리를 위해 async/await 문법을 자주 사용하게 됩니다. 코드가 간결해지고 가독성이 좋아지기 때문입니다.하지만 Express(버전 4 이하)는 비동기 함수에서 발생한 에러를 자동으"
date: 2025-11-27
category: "웹 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/42"
---


안녕하세요.

Node.js의 Express 프레임워크를 사용하여 백엔드 서버를 개발하다 보면, 비동기 처리를 위해 async/await 문법을 자주 사용하게 됩니다. 코드가 간결해지고 가독성이 좋아지기 때문입니다.

하지만 Express(버전 4 이하)는 비동기 함수에서 발생한 에러를 자동으로 잡아내지 못한다는 치명적인 단점이 있습니다. 그래서 우리는 울며 겨자 먹기로 모든 라우터 함수마다 try-catch 블록을 사용해야 했습니다.

오늘은 단 3줄짜리 유틸리티 함수 하나로 지루한 try-catch 반복을 없애고, 코드를 깔끔하게 래핑(Wrapping)하여 관리하는 방법을 소개합니다.

### 1. 기존 방식의 문제점: try-catch 지옥

기존에 비동기 로직을 처리할 때는 에러가 발생하여 서버가 멈추는 것을 막기 위해 모든 라우터 핸들러에 예외 처리를 해야 했습니다.

아래 코드를 보면 실제 로직보다 에러 처리를 위한 코드가 더 많은 것을 볼 수 있습니다. 만약 API가 100개라면, try-catch도 100번을 써야 하는 비효율적인 구조입니다.

```
// 기존 방식
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    // 에러를 Express의 에러 핸들러로 넘김
    next(error);
  }
});
```

### 2. 해결책: catchAsync 래퍼(Wrapper) 함수

이 문제를 해결하기 위해 사용하는 것이 바로 래퍼 함수입니다. 함수를 감싸서(Wrap) 공통된 기능을 대신 수행해 주는 함수입니다.

방금 배우신 코드가 바로 그 역할을 합니다.

```
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

이 코드가 어렵게 느껴질 수 있는데, 원리를 하나씩 분해해 보겠습니다.

1. fn을 인자로 받음: 이 함수는 우리가 작성할 비동기 라우터 핸들러(fn)를 인자로 받습니다.
2. 새로운 함수 반환: (req, res, next)를 인자로 받는 새로운 익명 함수를 반환합니다. 이것이 실제로 Express가 실행할 미들웨어 함수가 됩니다.
3. Promise.resolve: 인자로 받은 fn을 실행합니다. 이때 fn이 비동기 함수(async)라면 프로미스(Promise)를 반환할 것입니다. Promise.resolve로 감싸주는 이유는 fn이 일반 함수여도 프로미스처럼 처리하기 위함입니다.
4. .catch(next): 만약 fn 실행 도중 에러가 발생하면(프로미스가 거부되면), .catch가 이를 잡아서 자동으로 next 함수에게 에러를 넘깁니다.

즉, 이 함수는 너는 비동기 로직만 짜, 에러가 나면 내가 알아서 next로 넘겨줄게라고 말하며 우리의 함수를 감싸주는 보호막 역할을 하는 것입니다.

### 3. 적용 후: 깔끔해진 코드

이제 catchAsync 함수로 라우터를 감싸주기만 하면, try-catch 문을 전부 제거할 수 있습니다.

```
// 래퍼 함수 적용
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new Error('User not found');
  }
  res.json(user);
});

router.get('/users/:id', getUser);
```

보시는 것처럼 try-catch 블록이 사라지고, 오로지 비즈니스 로직에만 집중할 수 있게 되었습니다. 에러가 발생하면 catchAsync가 알아서 catch하여 next로 전달하기 때문에, 개발자는 성공했을 때의 로직만 작성하면 됩니다.

### 마치며

이 기법은 고차 함수(Higher-Order Function)를 활용한 아주 좋은 예시입니다.

반복되는 에러 처리 코드를 줄이고 싶다면, 프로젝트 내에 utils 폴더를 만들고 이 catchAsync 함수를 작성하여 활용해 보세요. 코드의 가독성과 생산성이 훨씬 좋아질 것입니다.
