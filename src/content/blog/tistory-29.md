---
title: "[nodejs]res의 body값 출력 시 Promise{<pending>} 일 때"
slug: "tistory-29"
description: "처음 fetch를 활용할때 위코드와 같이 첫 번째 then 체인에서 body의 값을 확인하고자 하였으나출력값이 Promise { } 으로 표시되었습니다.export async function getArticle(articleId) { return fetch(`---------------"
date: 2025-10-01
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/29"
thumbnail: "/blog/images/tistory-29/img1.png"
---


처음 fetch를 활용할때 위코드와 같이 첫 번째 then 체인에서 body의 값을 확인하고자 하였으나

출력값이 Promise { <pending> } 으로 표시되었습니다.

```
export async function getArticle(articleId) {
  return fetch(`-------------------`)
    .then((res) => {
      if (!res.ok) {
        console.error(`전송 상태 에러: ${res.status}`);
        throw new Error(`전송 상태 에러`);
      }
      const body = res.json();
      console.log(body);
      return body;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}
```

단순히 생각햇을때 return res.json(); 이나 const body = res.json(); return body 나 비슷하다고 생각하였으나

res.json이 Promise 객체인 것을 생각 못하였습니다.

**즉 res.json()은 데이터가 아닌 Promise를 반환합니다.**

res.json이 Promise 객체이기에 body 에 할당 하고 body를 바로 출력하면

아직 **JSON 데이터 파싱이 완료되지 않은 상태**(pending)이므로 Promise {<pending>}으로 출력됩니다.

특히 서버가 응답을 시작해서 **헤더(headers)정보**만이라도 도착하면, fetch가 반환한 Promise 는 **Response 객체로 즉시 이행**되기에 데이터 본문(body)은 전부 다 받아온 상태가 아닐 수 있다는 것 입니다.

따라서 then 체인을 한번 더 사용하여 res.json이 반환한 Promise가 완전히 이행(resolve)될 때까지 기다렸다가 그 결과값을 사용해야합니다.

```
fetch('------------------------')
  .then(res => {
    // 첫 번째 .then 에서는 Response 객체를 받습니다.
    // 여기서 res.json()을 호출하면 '파싱 작업'을 시작하고 그 작업에 대한 Promise를 반환합니다.
    // 이 Promise를 return 해야 다음 .then 체인에서 결과값을 받을 수 있습니다.
    if (!res.ok) {
        throw new Error(`전송 상태 에러: ${res.status}`);
    }
    return res.json(); 
  })
  .then(data => {
    // 두 번째 .then 에서는 res.json() Promise가 완료된 후의 결과,
    // 즉 완전히 파싱된 JavaScript 객체(data)를 받습니다.
    console.log('=====PostArticleData=====');
    console.log(data); // 여기서 실제 데이터를 출력할 수 있습니다.
    console.log('=====PostArticleData End=====');
  })
  .catch(error => {
    console.error(error);
  });
```

단 2개의 then 체인으로 끝났지만 추후  여러 Promise 체이닝의 복잡함을 해결하기 위해

async / await 코드를 활용하는 것이 좋습니다.  
(async 사용시 await를 사용하여 비동기 작업을 처리하고 에러 처리를 위해 try...catch문 필히 사용)

```
export async function getArticle(articleId) {
  try {
    // 1. await를 사용해 fetch Promise가 완료되고 Response 객체를 받을 때까지 기다립니다.
    const res = await fetch(`-------------------`);

    // 2. 응답 상태를 확인합니다.
    if (!res.ok) {
      console.error(`전송 상태 에러: ${res.status}`);
      throw new Error(`전송 상태 에러`);
    }

    // 3. await를 사용해 res.json() Promise가 완료되고,
    //    파싱된 실제 데이터를 받을 때까지 기다립니다.
    const data = await res.json();

    console.log(data); // 이제 실제 데이터가 출력됩니다.
    return data;       // 실제 데이터를 반환합니다.

  } catch (error) {
    // 네트워크 오류나 위에서 throw된 에러를 여기서 한 번에 처리합니다.
    console.error(error);
    throw error; // 에러를 다시 던져서 이 함수를 호출한 쪽에서도 에러를 인지할 수 있게 합니다.
  }
}
```

![](/blog/images/tistory-29/img1.png)
