---
title: "namespace 네임스페이스, 네임스페이스 중첩"
slug: "tistory-7"
description: "namespace 네임스페이스는 작업공간을 분리하기 위함이다. 동일 문단에서의 동일한 함수명을 선언하면 오류가 나듯 여러명에서 작업시 동일한 함수명을 사용할 수 있기에 namespace를 통해 각자만의 작업공간을 만들어두는 것이다. 아래 예시의 Persontwo 의 PersonWalle"
date: 2021-12-27
category: "C++"
tags: [이관]
source: "https://bluehamster.tistory.com/7"
---


namespace

네임스페이스는 작업공간을 분리하기 위함이다.

동일 문단에서의 동일한 함수명을 선언하면 오류가 나듯

여러명에서 작업시 동일한 함수명을 사용할 수 있기에

namespace를 통해 각자만의 작업공간을 만들어두는 것이다.

  아래 예시의 Persontwo 의 PersonWallet 과 같이 중첩사용도 가능하다.

 

namespace Personone

{

void samplefunc(){...}

}

namespace Persontwo

{

void samplefunc(){..,}

      namespace PersonWallet

      {

         void NowMoney(){...}

      }

}

 

void main()

{

Personone::samplefunc();

Persontwo::samplefunc();

Persontwo::NowMoney::samplefunc();

}
