---
title: "c++ 매크로 함수, 인라인(inline)함수"
slug: "tistory-5"
description: "c++ 매크로 함수, 인라인(inline)함수 매크로 함수의 장점-> 일반적인 함수에 비해 실행속도가 빨라진다. 매크로 함수의 단점-> 복잡한 함수는 매크로의 형태로 정의하는데 한계가 있다. #include #define SQUARE(x) ((x)*(x)) void main() { st"
date: 2021-12-26
category: "C++"
tags: [이관]
source: "https://bluehamster.tistory.com/5"
---


c++ 매크로 함수, 인라인(inline)함수

 

매크로 함수의 장점-> 일반적인 함수에 비해 실행속도가 빨라진다.

매크로 함수의 단점-> 복잡한 함수는 매크로의 형태로 정의하는데 한계가 있다.

 

#include <iostream>

#define SQUARE(x) ((x)\*(x))

 

void main()

{

std::cout<<SQUARE(5) <<std::endl;

}

 

c#에서는 #define 이 없어 const를 통해 대체하였었다.

 

매크로 함수의 단점을 보안하기 위한 것이 인라인 함수(inline)

인라인 함수의 장점-> 매크로 함수의 장점을 가지고있으며 단점도 보안되었다.

인라인 함수의 단점-> 매크로함수는 자료형에 의존하지 않지만 인라인함수는 자료형이 있어 데이터의 손실이 발생된다.

인라인 함수의 특이점-> 컴파일러는 함수의 인라인화가 성능에 해가된다 판단되면 키워드를 무시하기도 하며 필요한 경우 임의로 인라인 처리하기도 한다.

 

#include <iostream>

 

inline int SQUARE(int x)

{

return x\*x;

}

void main()

{

std::cout<<SQUARE(5) <<std::endl;

}
