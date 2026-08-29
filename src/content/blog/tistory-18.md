---
title: "모음의 개수 / 백준"
slug: "tistory-18"
description: "https://www.acmicpc.net/problem/1264 백준 문제(1264) / 모음의 개수 처음 if의 반복을 통해 단순 비교로 하려 하였으나 ToLower 와 Contains 를 통하여 더 간결하게 줄일 수 있음을 확인하였습니다. using System;public cla"
date: 2025-09-17
category: "코딩테스트"
tags: [이관]
source: "https://bluehamster.tistory.com/18"
---


<https://www.acmicpc.net/problem/1264>

백준 문제(1264) / 모음의 개수

처음 if의 반복을 통해 단순 비교로 하려 하였으나 ToLower 와 Contains 를 통하여 더 간결하게 줄일 수 있음을 확인하였습니다.

```
using System;

public class PascalTriangle
{
    public static void Main(string[] args)
    {
        List<int> result = new List<int>();
        for (; ; )
        {

            string input = Console.ReadLine();
            if (input == "#") break;

            int temp = 0;
            foreach (char c in input.ToLower())//문자열을 전부 소문자로 변경
            {
                if ("aeiou".Contains(c))//모음 "a e i o u" 중 해당하는 글자가 있는지 확인
                {
                        temp++;
                }
            }
            result.Add(temp);
        }
        for (int i = 0; i < result.Count; i++)
        {
            Console.WriteLine(result[i]);

        }
    }
}
```

아래 코드는 Gemini Ai 를 통해 개선한 코드 내용입니다.

```
using System;
using System.Collections.Generic; // List<int> 사용을 위해 추가

public class VowelCounter
{
    public static void Main(string[] args)
    {
        // 배열 대신 List<int>를 사용하여 동적으로 크기 관리
        List<int> results = new List<int>();

        while (true)
        {
            string input = Console.ReadLine();

            // '#' 입력 시 반복문 종료
            if (input == "#")
            {
                break;
            }

            // ToLower()를 사용하여 대소문자 구분 없이 모음 개수 세기
            int count = 0;
            foreach (char c in input.ToLower())
            {
                if ("aeiou".Contains(c))
                {
                    count++;
                }
            }
            results.Add(count); // List에 결과 추가
        }

        // foreach 문을 사용하여 List의 모든 요소 출력
        foreach (int result in results)
        {
            Console.WriteLine(result);
        }
    }
}
```
