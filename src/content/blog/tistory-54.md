---
title: "[VS Code] 빌드 과정 귀찮을 때 쓰는 TypeScript 디버깅 설정 (tsx + launch.json)"
slug: "tistory-54"
description: "안녕하세요. Node.js와 TypeScript로 백엔드 개발을 공부하다 보면 디버깅 환경을 세팅하는 게 꽤나 번거롭습니다. 보통은 tsc로 빌드를 해서 자바스크립트 파일로 만든 뒤에 실행하거나, ts-node 등을 사용하곤 합니다. 하지만 프로젝트 규모가 커지거나 빠르게 로직만 확인하"
date: 2026-01-13
category: "이슈 해결 기록"
tags: [이관]
source: "https://bluehamster.tistory.com/54"
thumbnail: "/blog/images/tistory-54/img1.png"
---


안녕하세요.

Node.js와 TypeScript로 백엔드 개발을 공부하다 보면 디버깅 환경을 세팅하는 게 꽤나 번거롭습니다. 보통은 tsc로 빌드를 해서 자바스크립트 파일로 만든 뒤에 실행하거나, ts-node 등을 사용하곤 합니다.

하지만 프로젝트 규모가 커지거나 빠르게 로직만 확인하고 싶을 때, 매번 빌드 파일을 생성하는 건 비효율적입니다.

오늘은 별도의 빌드 과정 없이 .ts 파일을 즉시 실행하고, 브레이크 포인트(중단점)까지 확실하게 잡히는 VS Code 디버깅 설정을 공유하려고 합니다. tsx라는 고성능 로더를 활용한 방법입니다.

![](/blog/images/tistory-54/img1.png)

### 1. launch.json 설정 공유

프로젝트의 .vscode/launch.json 파일에 아래 내용을 그대로 복사해서 사용하시면 됩니다.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server (tsx)",
      "runtimeExecutable": "node",
      "runtimeArgs": ["--import", "tsx"],
      "args": ["${workspaceFolder}/src/app.ts"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG_MODE": "true"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 2. 핵심 설정 상세 분석

위 설정이 어떻게 빌드 없이 TypeScript를 디버깅하는지, 중요한 부분만 짚어서 정리해 보겠습니다.

#### runtimeArgs: ["--import", "tsx"] (가장 중요)

이 설정의 핵심입니다. 우리는 ts-node 대신 Node.js의 최신 기능인 모듈 로더를 사용합니다. node 명령어를 실행할 때 tsx 모듈을 먼저 불러오도록(import) 지시하는 것입니다. tsx는 TypeScript 코드를 메모리 상에서 즉시 JavaScript로 변환하여 실행해 줍니다. 덕분에 물리적인 빌드 파일(dist/app.js)을 만들지 않아도 됩니다.

#### args: ["${workspaceFolder}/src/app.ts"]

실행할 메인 파일의 경로입니다. ${workspaceFolder}는 현재 VS Code로 열려있는 프로젝트의 루트 경로를 뜻합니다. 본인의 프로젝트 구조에 맞춰 src/app.ts 부분을 src/index.ts나 src/server.ts 등으로 수정해서 사용하면 됩니다.

#### skipFiles: ["<node\_internals>/\*\*"]

디버깅을 하다 보면 함수 안으로 들어가는 'Step Into' 기능을 자주 씁니다. 이때 이 설정이 없으면 Node.js의 내부 코드(fs.js, http.js 등)까지 디버거가 들어가 버려서 흐름을 놓치기 쉽습니다. 내부 코드는 건너뛰고 오직 내가 작성한 코드에만 집중하기 위한 필수 옵션입니다.

#### console: "integratedTerminal"

서버의 로그를 어디에 띄울지 결정합니다. 이 옵션을 사용하면 VS Code 하단의 터미널 탭에 로그가 출력되어, 일반적인 터미널 환경처럼 편하게 확인할 수 있습니다.

### 3. 마무리

이 설정을 적용하면 F5 키를 누르는 것만으로 서버가 시작되고, TypeScript 코드 위에 찍어둔 빨간 점(브레이크 포인트)에서 정확하게 멈추는 것을 확인할 수 있습니다.

복잡한 nodemon 설정이나 source-map 설정 때문에 골머리 앓지 마시고, tsx를 활용해서 쾌적한 디버깅 환경을 구축해 보세요.
