---
title: "럭비 클럽 / 백준"
slug: "tistory-20"
description: "https://www.acmicpc.net/problem/2083 럭비 클럽 (2083) / 백준 using System;public class CodeCanvas{ public static void Main(string[] args) { List list = new List(); wh"
date: 2025-09-18
category: "코딩테스트"
tags: [이관]
source: "https://bluehamster.tistory.com/20"
---


<https://www.acmicpc.net/problem/2083>

럭비 클럽 (2083) / 백준

```csharp
using System;

public class CodeCanvas
{
    public static void Main(string[] args)
    {
        List<string> list = new List<string>();
        while (true)
        {
            string[] line = Console.ReadLine().Split(' ');
            if (line[0].Contains("#")) break;

            string collect = "Junior";

            if (int.Parse(line[1]) > 17 || int.Parse(line[2]) >= 80)
                collect = "Senior";

            list.Add($"{line[0]} {collect}");
        }
        foreach (string line in list)
        {
            Console.WriteLine(line);
        }
    }
}
```

Gemini를 사용하여 개선 내용

주요 내용

- **데이터 타입 활용**: Console.ReadLine().Split(' ')로 받은 문자열 배열에서 나이와 몸무게를 int.Parse를 사용해 매번 변환하고 있습니다. 이를 미리 정수 변수에 저장해두면 코드가 더 간결해지고 효율적입니다.
- **즉시 출력**: 현재 코드는 모든 결과를 List<string>에 저장한 후 마지막에 한 번에 출력합니다. 문제의 특성상 입력을 한 줄씩 처리하고 바로 결과를 출력하는 것이 더 효율적이며 메모리 사용량도 줄일 수 있습니다.

```csharp
using System;

public class CodeCanvas
{
    public static void Main(string[] args)
    {
        while (true)
        {
            string[] input = Console.ReadLine().Split(' ');
            string name = input[0];
            int age = int.Parse(input[1]);
            int weight = int.Parse(input[2]);

            // 종료 조건: 이름이 '#'이고 나이와 몸무게가 0일 때
            if (name == "#" && age == 0 && weight == 0)
            {
                break;
            }

            // 조건에 따라 회원 등급을 결정
            string memberClass = "Junior";
            if (age > 17 || weight >= 80)
            {
                memberClass = "Senior";
            }

            // 결과를 즉시 출력
            Console.WriteLine($"{name} {memberClass}");
        }
    }
}
```
