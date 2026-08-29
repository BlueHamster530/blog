---
title: "using 키워드"
slug: "tistory-8"
description: "using 키워드는 특정 이름공간(namespace)의 있는 함수를 호출할때에는 이름공간을 지정하지 않고 호출하기위한 키워드이다. #include namespace Bird { void Name() { std::cout"
date: 2021-12-27
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/8"
---


using 키워드는 특정 이름공간(namespace)의 있는 함수를 호출할때에는

이름공간을 지정하지 않고 호출하기위한 키워드이다.

 

#include <iostream>

 

namespace Bird

{

void Name()

{

std::cout << "새의 이름은 종달새 입니다." << std::endl;

}

}

 

void main()

{

using Bird::Name;

Name();

}
