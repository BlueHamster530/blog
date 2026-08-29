---
title: "문자열 reverse 메소드를 통해 뒤집기"
slug: "tistory-25"
description: "function reverseString(_str){ return _str.split('').reverse().join('');} split 을 통해 글자단위로 자르고 배열의 reverse 메소드를 이용해서 배열을 뒤집은 후 join으로 string 으로 변환 기존에 문자열 뒤집기 시 "
date: 2025-09-23
category: "JS"
tags: [이관]
source: "https://bluehamster.tistory.com/25"
---


function reverseString(\_str)  
{  
 return \_str.split('').reverse().join('');  
}

split 을 통해 글자단위로 자르고 배열의 reverse 메소드를 이용해서 배열을 뒤집은 후 join으로 string 으로 변환

기존에 문자열 뒤집기 시 아래 코드와 같이 반복문으로 돌리는 것 보다 간결해서 기록

  let result ="";  
  for(let i = 0 ; i < \_str.length;i++)  
  {  
    result += \_str[\_str.length-1-i];  
  }  
  return result;
