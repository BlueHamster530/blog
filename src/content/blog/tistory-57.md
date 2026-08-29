---
title: "[Web] 실시간 통신의 핵심, 웹소켓(WebSocket) 완벽 정리"
slug: "tistory-57"
description: "안녕하세요. 오늘은 웹 개발, 특히 백엔드 개발에서 실시간 서비스를 구현할 때 필수적으로 알아야 할 웹소켓(WebSocket)에 대해 정리해 보려고 합니다. 우리가 매일 사용하는 카카오톡, 디스코드 같은 메신저나 빗썸 같은 가상화폐 거래소의 실시간 시세창, 그리고 실시간 협업 도구(Fi"
date: 2026-01-15
category: "웹 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/57"
thumbnail: "/blog/images/tistory-57/img1.png"
---


안녕하세요.

오늘은 웹 개발, 특히 백엔드 개발에서 실시간 서비스를 구현할 때 필수적으로 알아야 할 **웹소켓(WebSocket)**에 대해 정리해 보려고 합니다.

우리가 매일 사용하는 카카오톡, 디스코드 같은 메신저나 빗썸 같은 가상화폐 거래소의 실시간 시세창, 그리고 실시간 협업 도구(Figma 등)는 어떻게 서버의 데이터를 즉각적으로 화면에 보여줄까요? 그 비밀은 바로 웹소켓에 있습니다.

---

### 1. 왜 웹소켓이 필요할까? (HTTP의 한계)

기존의 **HTTP 프로토콜**은 기본적으로 **단방향 통신**입니다. 클라이언트(브라우저)가 요청(Request)을 보내야만 서버가 응답(Response)을 줄 수 있습니다. 그리고 응답을 받고 나면 연결을 끊어버립니다(Stateless).

하지만 실시간 채팅이나 게임처럼 **서버가 클라이언트에게 먼저 데이터를 보내야 하는 상황**에서는 HTTP만으로는 한계가 있습니다. 이를 해결하기 위해 등장한 것이 바로 **웹소켓(WebSocket)**입니다.

- **웹소켓(WebSocket):** 클라이언트와 서버가 연결을 유지한 상태에서 자유롭게 양방향으로 메시지를 주고받을 수 있는 프로토콜입니다.

---

### 2. 웹소켓 이전에 사용하던 방식들

웹소켓이 표준이 되기 전에는 HTTP를 이용해서 실시간처럼 보이게 만드는 여러 기법이 있었습니다.

#### ① Polling (Short Polling)

- 클라이언트가 주기적(예: 1초마다)으로 서버에 "새로운 데이터 있어?"라고 물어보는 방식입니다.
- **장점:** 구현이 매우 쉽습니다.
- **단점:** 데이터가 없어도 계속 물어봐야 하므로 불필요한 트래픽과 서버 부하가 심합니다.

#### ② Long Polling

- 클라이언트가 요청을 보내면, 서버는 데이터가 생길 때까지 응답을 보류하고 기다립니다. 데이터가 생기면 응답을 보내고, 클라이언트는 받자마자 다시 요청을 보냅니다.
- **장점:** Short Polling보다는 불필요한 요청이 줄어듭니다.
- **단점:** 연결을 계속 유지해야 하므로 접속자가 많아지면 서버 메모리와 커넥션 리소스가 고갈될 수 있습니다.

#### ③ Server-Sent Events (SSE)

- 클라이언트가 연결 요청을 한 번 보내면, 서버가 원할 때 데이터를 계속 내려보낼 수 있는 스트림 방식입니다.
- **장점:** Polling 방식보다 훨씬 효율적입니다.
- **단점:** 서버 → 클라이언트로만 보낼 수 있는 **단방향** 통신입니다. (예: 주식 시세 알림에는 적합하지만, 채팅에는 부적합)

---

### 3. 웹소켓 연결 과정 (Handshake)

웹소켓도 처음에는 HTTP 요청으로 시작된다는 사실, 알고 계셨나요? 이 과정을 **핸드셰이크(Handshake)**라고 합니다.

1. **클라이언트 요청 (HTTP GET):** 브라우저는 Upgrade: websocket과 Connection: Upgrade 헤더를 담아 서버에 요청을 보냅니다. "우리 이제 HTTP 말고 웹소켓으로 대화하자!"라고 제안하는 것입니다. 이때 보안을 위한 키(Sec-WebSocket-Key)도 함께 보냅니다.

   ```
   GET / HTTP/1.1
   Host: example.com
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: x3JJHMbDL1EzLkh9Gb7lhH4RLlApslN
   Sec-WebSocket-Version: 13
   ```
2. **서버 응답 (101 Switching Protocols):** 서버가 이를 수락하면 101 Switching Protocols 상태 코드와 함께 응답합니다.

   ```
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: <서버가_생성한_인증키>
   ```

이 과정이 끝나면 프로토콜이 ws:// (또는 보안이 적용된 wss://)로 변경되며, 연결이 끊어질 때까지 양방향 통신이 가능해집니다.

---

### 4. 실습: Postman & JavaScript 코드

#### Postman으로 에코 서버 테스트하기

개발 단계에서 웹소켓 API를 테스트할 때는 Postman 데스크톱 앱이 유용합니다.

1. **New > WebSocket Request** 생성
2. URL에 wss://echo.websocket.org 입력 (메시지를 그대로 돌려주는 무료 테스트 서버)
3. **Connect** 버튼 클릭 후 메시지 전송(Send) 테스트

#### 프론트엔드 코드 예시

웹 브라우저에서는 기본적으로 WebSocket API를 제공합니다.

```javascript
// 1. 소켓 연결 생성
const socket = new WebSocket("ws://localhost:8080");

// 2. 연결이 열리면 실행 (Open)
socket.addEventListener("open", function (event) {
  console.log("서버와 연결되었습니다.");
  socket.send("Hello Server!"); // 메시지 전송
});

// 3. 메시지 수신 시 실행 (Message)
socket.addEventListener("message", function (event) {
  console.log("서버로부터 받은 메시지: ", event.data);
});

// 4. 연결 종료
// socket.close();
```

---

### 5. 핵심 개념: Event Emitter (Node.js)

Node.js 환경에서 웹소켓 서버를 구현할 때 자주 마주치는 패턴이 바로 **Event Emitter**입니다. 이는 디자인 패턴 중 **옵저버 패턴(Observer Pattern)**의 구현체라고 볼 수 있습니다.

- 특정 이벤트(message, close 등)가 발생하면 등록된 함수(리스너)를 실행하는 구조입니다.

```javascript
import { EventEmitter } from 'events';

const myEmitter = new EventEmitter();

// 'hello' 이벤트가 발생하면 실행할 리스너 등록
myEmitter.on('hello', () => {
  console.log('안녕하세요!');
});

// 'hello' 이벤트 발생시키기
myEmitter.emit('hello');
```

실제 웹소켓 라이브러리(ws, socket.io 등)도 내부적으로는 이 Event Emitter 패턴을 사용하여, 클라이언트로부터 메시지가 오거나 연결이 끊기는 사건을 처리합니다.

---

### 마무리

오늘은 실시간 통신의 표준인 웹소켓에 대해 알아보았습니다. 채팅, 주식 차트, 온라인 게임 등 현대적인 웹 애플리케이션에서 웹소켓은 선택이 아닌 필수 기술입니다. HTTP와의 차이점, 그리고 핸드셰이크 과정을 잘 이해하고 있다면, 추후 Socket.io 같은 라이브러리를 사용할 때도 훨씬 깊이 있게 활용하실 수 있을 것입니다.

![](/blog/images/tistory-57/img1.png)

**참고 자료**

- [MDN Web Docs - WebSocket API](https://developer.mozilla.org/ko/docs/Web/API/WebSockets_API)
- [Ably - WebSockets vs Long Polling](https://ably.com/blog/websockets-vs-long-polling)
