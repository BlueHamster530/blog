---
title: "c++의 입출력"
slug: "tistory-3"
description: "c++ 입출력 c언어의 stdio.h의 역할처럼 c++에서의 입출력은 #include 을 불러온다. //c++에서는 프로그래머가 정의하는 헤더가 아닌 표준헤더 파일의 선언의 확장자는 생략하기로 약속되어있다. 출력) printf를 대신하는 std::cout std::cout"
date: 2021-12-26
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/3"
---


c++ 입출력

 

c언어의 stdio.h의 역할처럼

c++에서의 입출력은

#include <iostream>을 불러온다.

//c++에서는 프로그래머가 정의하는 헤더가 아닌 표준헤더 파일의 선언의 확장자는 생략하기로 약속되어있다.

 

출력) printf를 대신하는 std::cout

std::cout<< ‘츨력’<<‘출력2’<<’출력3’;

std::cout<<“Test”<<std::endl;

입력) scanf를 대신하는 std::cin

int num1;

std::>>num1;
