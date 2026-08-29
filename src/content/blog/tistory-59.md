---
title: "[Web] 개발자를 괴롭히는 빨간 에러, CORS 완벽 이해하기"
slug: "tistory-59"
description: "안녕하세요. 웹 개발 프로젝트를 진행하다 보면, 특히 프론트엔드(React, Vue 등)와 백엔드(Spring, Node.js 등)의 서버 포트를 다르게 띄우고 연동할 때 콘솔창에서 시뻘건 에러 메시지를 마주하게 됩니다. Access to XMLHttpRequest at '...' fr"
date: 2026-01-19
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/59"
thumbnail: "/blog/images/tistory-59/img1.png"
---


안녕하세요.

웹 개발 프로젝트를 진행하다 보면, 특히 프론트엔드(React, Vue 등)와 백엔드(Spring, Node.js 등)의 서버 포트를 다르게 띄우고 연동할 때 콘솔창에서 시뻘건 에러 메시지를 마주하게 됩니다.

Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy

처음 이 에러를 접하면 내 코드가 잘못된 것인지, 네트워크 문제인지 당황하게 됩니다. 하지만 이것은 브라우저가 여러분을 보호하기 위해 작동하는 아주 정상적인 보안 장치입니다.

오늘은 CORS가 도대체 무엇이며, 왜 발생하고, 어떻게 해결해야 하는지 알아보겠습니다.

![](/blog/images/tistory-59/img1.png)

### 1. CORS가 생겨난 배경: SOP (Same-Origin Policy)

CORS를 알기 위해서는 먼저 **SOP(동일 출처 정책)**를 알아야 합니다.

웹 생태계에는 보안을 위한 기본적인 원칙이 있습니다. 어떤 출처(Origin)에서 불러온 문서나 스크립트가 다른 출처의 리소스와 상호작용하는 것을 제한하는 정책입니다.

쉽게 말해, google.com에서 켜진 자바스크립트 코드가 사용자의 의지와 상관없이 naver.com에 요청을 보내 개인정보를 빼오거나 글을 쓰는 행위를 막기 위함입니다. 브라우저는 기본적으로 다른 출처로의 요청을 차단합니다.

여기서 말하는 **출처(Origin)**란 다음 세 가지가 모두 같아야 동일하다고 판단합니다.

1. 프로토콜 (Protocol): http vs https
2. 호스트 (Host): localhost vs <https://www.google.com/url?sa=E&source=gmail&q=google.com>
3. 포트 (Port): 80 vs 8080

만약 http://localhost:3000 (프론트엔드)에서 http://localhost:8080 (백엔드)으로 API 요청을 보낸다면? 호스트는 같지만 **포트 번호**가 다르므로 **다른 출처(Cross-Origin)**로 인식되어 브라우저가 차단하게 됩니다.

### 2. CORS (Cross-Origin Resource Sharing) 란?

하지만 웹 생태계가 발전하면서 다른 출처의 리소스를 가져와야 하는 일이 너무나 빈번해졌습니다. (예: 유튜브 API 사용, 프론트-백엔드 분리 개발 등)

그래서 무조건 막는 SOP의 예외 조항으로 만들어진 것이 바로 **CORS(교차 출처 리소스 공유)**입니다.

서버가 "나는 이 출처의 요청은 허용해 줄 거야"라고 브라우저에게 알려주면, 브라우저가 이를 확인하고 차단을 해제해 주는 방식입니다.

### 3. 동작 원리: 프리플라이트 요청 (Preflight Request)

CORS의 가장 독특한 특징은 요청을 두 번 보낸다는 점입니다. (Simple Request 제외)

브라우저는 안전을 위해 본 요청을 보내기 전에 예비 요청(Preflight Request)을 먼저 날립니다.

1. **예비 요청 (OPTIONS):** 브라우저가 서버에게 OPTIONS 메서드로 먼저 찔러봅니다. "나 localhost:3000 출신인데, 너한테 POST 요청 보내도 돼?"
2. **서버 응답:** 서버는 허용하는 출처와 메서드 정보를 헤더에 담아 응답합니다. Access-Control-Allow-Origin: http://localhost:3000
3. **브라우저 검사:** 서버가 보낸 헤더와 내 출처를 비교합니다. 허용된 출처라면 그때 진짜 본 요청(POST)을 보냅니다.

만약 서버가 CORS 설정을 해주지 않았다면, 2번 단계에서 적절한 헤더가 오지 않으므로 브라우저는 에러를 띄우고 본 요청을 보내지 않거나 응답을 파기합니다.

**주의할 점:** CORS 에러는 **브라우저**가 내는 에러입니다. 서버 간 통신(Server to Server)이나 Postman 같은 툴에서는 CORS 정책이 적용되지 않으므로 에러가 발생하지 않습니다. 오직 브라우저를 통할 때만 발생합니다.

### 4. 해결 방법

해결의 열쇠는 백엔드 서버가 쥐고 있습니다. 서버 응답 헤더에 Access-Control-Allow-Origin을 포함시켜 주면 됩니다.

#### 1) 백엔드에서 설정하기 (정석)

가장 근본적인 해결책입니다.

- **Spring Boot:** @CrossOrigin 어노테이션을 컨트롤러에 붙이거나, WebMvcConfigurer 설정에서 addCorsMappings를 통해 전역 설정을 합니다.
- **Node.js (Express):** cors 미들웨어를 설치하여 app.use(cors())를 적용합니다.

#### 2) 프론트엔드 프록시(Proxy) 서버 사용 (개발 환경)

개발 단계에서만 임시로 사용하는 방법입니다. React나 Vue의 개발 서버(Dev Server) 설정에서 프록시를 설정하면, 브라우저는 같은 출처(localhost:3000)로 요청을 보낸다고 착각하게 만들 수 있습니다. 개발 서버가 백엔드로 요청을 대신 전달해주기 때문입니다.

### 마치며

CORS 에러를 만났을 때 가장 쉬운 해결책은 모든 출처를 허용하는 와일드카드(\*)를 사용하는 것입니다.

하지만 이는 보안상 큰 구멍을 만드는 행위이므로, 실무에서는 반드시 신뢰할 수 있는 특정 도메인만 명시적으로 허용하는 것이 중요합니다.

CORS는 개발자를 괴롭히려는 에러가 아니라, 사용자의 데이터를 보호하기 위한 브라우저의 방어막이라는 점을 기억해 주시기 바랍니다.
