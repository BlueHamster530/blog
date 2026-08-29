---
title: "[Node.js/PM2] 하나의 서버에서 여러 앱 돌리다가 .env 토큰 증발한 썰 (feat. 경로의 중요성)"
slug: "tistory-79"
description: "안녕하세요! 코드로 세상을 구축하고픈 백엔드 개발자입니다. 🚀 최근 AWS Lightsail 서버 하나에 뉴스 키워드 검색 알림, 공고알림 등을 수행하는 3개의 봇을 각각 다른 폴더로 나누어 배포하는 작업을 진행했습니다.폴더 구조를 깔끔하게 분리하고, 각각의 봇 폴더 안에 .env 파일"
date: 2026-05-16
category: "서버 개발"
tags: [env, Lightsail, nodejs, PM2, 서버배포, 트러블슈팅]
source: "https://bluehamster.tistory.com/79"
thumbnail: "/blog/images/tistory-79/img1.png"
---


![](/blog/images/tistory-79/img1.png)

안녕하세요! 코드로 세상을 구축하고픈 백엔드 개발자입니다. 🚀 최근 AWS Lightsail 서버 하나에 **뉴스 키워드 검색 알림, 공고알림** 등을 수행하는 3개의 봇을 각각 다른 폴더로 나누어 배포하는 작업을 진행했습니다.

폴더 구조를 깔끔하게 분리하고, 각각의 봇 폴더 안에 .env 파일을 고이 모셔둔 뒤 당당하게 PM2를 실행했는데... 어라?

```
Error: Token not provided 
# (PM2: 토큰이 없는데요? 🤷‍♂️)
```

분명히 .env 파일에 API 키값을 제대로 넣어뒀는데, 귀신같이 토큰을 찾지 못하는 현상이 발생했습니다. 오늘은 이 귀신(?)의 정체와 PM2 환경에서의 우아한 해결 방법에 대해 정리해 보겠습니다.

---

### 1. 도대체 왜 에러가 났을까? (원인은 '실행 위치')

가장 흔히 하는 실수는 최상위 폴더(예: 홈 디렉터리)에서 아래와 같이 PM2를 실행하는 것입니다.

```bash
# 최상위 폴더에서 당당하게 실행!
pm2 start assmbly_job_alert_bot/assmbly_job.js
```

이 코드를 실행하면 Node.js 프로세스는 정상적으로 켜집니다. 문제는 dotenv 라이브러리가 .env 파일을 찾는 '기준 위치'에 있습니다. 우리는 assmbly\_job.js를 실행했으니 당연히 그 파일이 있는 하위 폴더에서 .env를 찾을 거라 기대하지만, 컴퓨터는 그렇게 눈치가 빠르지 않습니다.

```
graph TD
    A[최상위 폴더 '/home/ubuntu'] -->|pm2 start 실행| B(dotenv 모듈 작동)
    B --> C{어디서 .env를 찾을까?}
    C -->|명령어를 입력한 최상위 폴더 탐색| D[결과: .env 파일 없음!]
    D --> E[Error: Token not provided]
    
    style D fill:#ffcccc,stroke:#ff0000
    style E fill:#ff9999,stroke:#cc0000
```

비유하자면, "배달 기사님께 아파트 동/호수는 안 알려주고, 아파트 정문에서 치킨을 두고 가라고 한 상황"과 같습니다. 기사님(dotenv)은 정문(최상위 폴더)에서 두리번거리다 결국 토큰을 찾지 못하고 undefined를 뱉어내는 것이죠.

---

### 2. 해결 방법 1: --cwd 옵션으로 작업 디렉터리 콕 집어주기

가장 직관적인 해결책은 PM2에게 "이 프로세스의 작업 기준 폴더(Current Working Directory)는 저 하위 폴더야!"라고 명시해 주는 것입니다. --cwd 옵션을 사용하면 됩니다.

```bash
# assmbly 봇 실행 (경로 강제 지정)
pm2 start assmbly_job_alert_bot/assmbly_job.js --name "assmbly" --cwd ./assmbly_job_alert_bot

# narajob 봇 실행
pm2 start narajob_alert_bot/narajob.js --name "narajob" --cwd ./narajob_alert_bot
```

이렇게 하면 PM2가 프로세스를 실행할 때 ./assmbly\_job\_alert\_bot 폴더를 기준으로 삼기 때문에, 그 안에 있는 .env 파일을 찰떡같이 읽어옵니다.

---

### 3. 해결 방법 2: ecosystem.config.js 활용 (✨가장 깔끔하고 권장하는 방법)

명령어로 매번 --cwd를 입력하는 건 개발자의 귀차니즘... 아니, 생산성 철학에 위배됩니다. 서버를 재부팅하거나 앱이 여러 개일 때는 관리하기가 너무 까다롭죠.

우리의 정신 건강과 퇴근 시간을 지키기 위해, **최상위 폴더에 ecosystem.config.js 설정 파일 하나를 만들어 중앙 통제실을 구축**하는 것이 좋습니다.

```javascript
// 최상위 폴더에 ecosystem.config.js 생성
module.exports = {
  apps: [
    {
      name: 'assmbly',
      script: './assmbly_job.js',
      cwd: './assmbly_job_alert_bot', // 핵심! 파일이 있는 폴더로 작업 경로 설정
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'narajob',
      script: './narajob.js',
      cwd: './narajob_alert_bot',
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'news_bot', // 뉴스 키워드 검색 알림 봇 (Python 예시)
      script: 'main.py', 
      cwd: './news_alert_bot',
      interpreter: 'python3' // 파이썬 스크립트도 문제없음!
    }
  ]
};
```

이제 최상위 폴더에서 마법의 명령어 하나만 입력하면 됩니다.

```bash
pm2 start ecosystem.config.js
```

이 명령어 한 방이면 3개의 봇이 각각 자신의 방(cwd)에서 올바른 .env 파일을 입고 우아하게 실행됩니다.

---

### 💡 마무리하며

서버 하나에서 여러 서비스를 띄울 때는 항상 '현재 프로세스의 실행 위치(Working Directory)'를 꼼꼼히 체크해야 한다는 뼈저린 교훈을 얻었습니다. 로컬 환경에서는 폴더별로 터미널을 열어서 몰랐던 문제들이, 막상 배포 환경에 가면 튀어나오곤 하네요.

비슷한 구조로 다중 봇이나 마이크로서비스를 배포하시는 분들께 이 글이 조금이나마 시간을 아껴주는 단비가 되길 바랍니다. 오늘도 버그 없는 하루 보내세요! 👨‍💻
