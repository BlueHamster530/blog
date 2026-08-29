---
title: "부호 / 백준 (C#)"
slug: "tistory-24"
description: "https://www.acmicpc.net/problem/1247 문제N개의 정수가 주어지면, 이 정수들의 합 S의 부호를 구하는 프로그램을 작성하시오.입력총 3개의 테스트 셋이 주어진다. 각 테스트 셋의 첫째 줄에는 N(1 ≤ N ≤ 100,000)이 주어지고, 둘째 줄부터 N개의 줄"
date: 2025-09-22
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/24"
---


<https://www.acmicpc.net/problem/1247>

## 문제

N개의 정수가 주어지면, 이 정수들의 합 S의 부호를 구하는 프로그램을 작성하시오.

## 입력

총 3개의 테스트 셋이 주어진다. 각 테스트 셋의 첫째 줄에는 N(1 ≤ N ≤ 100,000)이 주어지고, 둘째 줄부터 N개의 줄에 걸쳐 각 정수가 주어진다. 주어지는 정수의 절댓값은 9223372036854775807보다 작거나 같다.

## 출력

총 3개의 줄에 걸쳐 각 테스트 셋에 대해 N개의 정수들의 합 S의 부호를 출력한다. S=0이면 "0"을, S>0이면 "+"를, S<0이면 "-"를 출력하면 된다.

## 예제 입력 1

```
3
0
0
0
10
1
2
4
8
16
32
64
128
256
-512
6
9223372036854775807
9223372036854775806
9223372036854775805
-9223372036854775807
-9223372036854775806
-9223372036854775804
```

## 예제 출력 1

```
0
-
+
```

위 내용을 풀기위해 간단하게 해결을 하려고 하였으나

```
public class Canvas
{
    public static void Main(string[] args)
    {
        char[] results = new char[3];
        for (int x = 0; x < 3; x++)
        {
            long n = long.Parse(Console.ReadLine());
            long[] numbers = new long[n];
            long result = 0;
            for (int i = 0; i < n; i++)
            {
                numbers[i] = long.Parse(Console.ReadLine());
                result += numbers[i];
            }
            if(result == 0) results[x] = '0';
            if(result < 0) results[x] = '-';
            if(result > 0) results[x] = '+';
        }
        foreach (char c in results) Console.WriteLine(c);
    }
}
```

위 코드를 작성했으나 틀렸다고 하기에 문제점을 확인 중

문제 내용 중 "정수값 9223372036854775807보다 작거나 같다" 라는 것을 미처 확인하지 못했습니다.

단순히 큰 수이기에 long 으로 입력하였으나 자료형 범위를 초과하였기에 오답처리가 되었습니다.

---

자료형 수정 + 구글 잼미니의 개선

**BigInteger 사용**: long 대신 \*\*BigInteger\*\*를 사용하여 합을 저장했습니다. 이 자료형은 정수의 크기 제한이 없어 오버플로우가 발생하지 않습니다.

**개선 사항 설명**

- **메모리 개선**: BigInteger[] numbers 배열을 완전히 제거했습니다. 입력값을 읽자마자 sum 변수에 바로 더하는 방식으로 변경하여 불필요한 메모리 할당을 없앴습니다.
- **효율성 개선**: if, else if, else 구조를 사용하여 조건 검사를 한 번만 수행하도록 했습니다. 이는 코드의 효율성을 높이고 논리를 더 명확하게 만듭니다.
- **간결성**: results 배열을 제거하고, 각 테스트 케이스의 결과를 계산하는 즉시 Console.WriteLine으로 출력하도록 변경했습니다. 이는 코드의 흐름을 단순화하고 불필요한 변수 사용을 줄입니다.

이러한 개선을 통해 코드는 더 **메모리 효율적**이고 **실행 속도**도 빨라집니다. 특히, 입력되는 숫자의 개수(n)가 매우 클 경우, BigInteger[] 배열을 만드는 것은 상당한 메모리 부담이 될 수 있으므로 이러한 방식은 매우 중요합니다.

```
using System;
using System.Numerics;

public class SignChecker
{
    public static void Main(string[] args)
    {
        for (int i = 0; i < 3; i++)
        {
            long n = long.Parse(Console.ReadLine());
            BigInteger sum = 0;
            for (int j = 0; j < n; j++)
            {
                // 입력받은 숫자를 배열에 저장하지 않고 바로 합산
                sum += BigInteger.Parse(Console.ReadLine());
            }
            // else if를 사용하여 조건문 효율 개선 및 결과 즉시 출력
            if (sum == 0)
            {
                Console.WriteLine("0");
            }
            else if (sum > 0)
            {
                Console.WriteLine("+");
            }
            else
            {
                Console.WriteLine("-");
            }
        }
    }
}
```
