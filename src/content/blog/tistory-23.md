---
title: "직사각형에서 탈출 / 백준 (C#)"
slug: "tistory-23"
description: "https://www.acmicpc.net/problem/1085 직사각형에서 탈출 문제한수는 지금 (x, y)에 있다. 직사각형은 각 변이 좌표축에 평행하고, 왼쪽 아래 꼭짓점은 (0, 0), 오른쪽 위 꼭짓점은 (w, h)에 있다. 직사각형의 경계선까지 가는 거리의 최솟값을 구하는 "
date: 2025-09-20
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/23"
---


<https://www.acmicpc.net/problem/1085>

직사각형에서 탈출

## 문제

한수는 지금 (x, y)에 있다. 직사각형은 각 변이 좌표축에 평행하고, 왼쪽 아래 꼭짓점은 (0, 0), 오른쪽 위 꼭짓점은 (w, h)에 있다. 직사각형의 경계선까지 가는 거리의 최솟값을 구하는 프로그램을 작성하시오.

## 입력

첫째 줄에 x, y, w, h가 주어진다.

## 출력

첫째 줄에 문제의 정답을 출력한다.

## 제한

- 1 ≤ w, h ≤ 1,000
- 1 ≤ x ≤ w-1
- 1 ≤ y ≤ h-1
- x, y, w, h는 정수

현 위치에서 상 하 좌 우 중 어디로 갔을때 빨리 가장자리로 도착하는지 체크하는 내용.

x 축과 y축 각각 최소거리를 구한 후 둘 중 더 낮은 수가 정답.

```
public class Canvas
{
    public static void Main(string[] args)
    {
        string[] list = Console.ReadLine().Split(' ');
        int x = int.Parse(list[0]);
        int y = int.Parse(list[1]);
        int w = int.Parse(list[2]);
        int h = int.Parse(list[3]);

        int xMinValue = (int)MathF.Min(w - x, x);//x축 기준 최소거리
        int yMinValue = (int)MathF.Min(h - y, y); //y축 기준 최소거리

        int minValue = (int)MathF.Min(xMinValue, yMinValue);

        Console.WriteLine(minValue);
    }
}
```

위 코드는 제가 작성한 코드로 정답은 되었지만

구글 잼미니를 통해 개선사항을 확인해 보았습니다.

---

제공해주신 코드는 **백준 1085번 직사각형에서 탈출** 문제에 대한 정확한 풀이입니다. 문제의 핵심인 "가장자리의 경계선까지의 최소 거리"를 올바르게 계산하고 있습니다.

하지만 코드를 좀 더 **간결하고 효율적**으로 개선할 수 있는 몇 가지 방법이 있습니다.

---

### **주요 개선 사항**

1. **MathF 대신 Math.Min 사용**: MathF.Min은 float 타입을 다루는 반면, Math.Min은 double을 기본으로 지원하며, 오버로딩을 통해 int 타입도 직접 사용할 수 있습니다. 문제의 변수들이 정수형(int)이므로, Math.Min을 사용하면 명시적인 형 변환((int))이 필요 없어 코드가 더 깔끔해집니다.
2. **변수 수 줄이기**: 중간 단계의 변수 xMinValue와 yMinValue를 생략하고, 한 줄로 최소값을 계산할 수 있습니다. 이는 코드의 길이를 줄여 가독성을 높입니다.

---

### **개선된 코드**

다음은 위 개선 사항을 적용한 코드입니다.

```
using System;
using System.Linq; // Split().Select()를 위해 추가

public class EscapeFromRectangle
{
    public static void Main(string[] args)
    {
        // 입력 문자열을 분리하고 바로 정수로 변환
        int[] input = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();

        int x = input[0];
        int y = input[1];
        int w = input[2];
        int h = input[3];

        // x축과 y축의 최소 거리를 각각 계산한 후, 그 두 값 중 더 작은 값을 최종 결과로 선택
        int minDistance = Math.Min(Math.Min(w - x, x), Math.Min(h - y, y));

        Console.WriteLine(minDistance);
    }
}
```

### **개선 사항 설명**

- **클래스명 변경**: 코드의 내용을 더 잘 반영하도록 클래스 이름을 Canvas에서 \*\*EscapeFromRectangle\*\*로 변경했습니다.
- **LINQ를 사용한 입력 처리**: Split()과 Select(int.Parse)를 연결하여 한 줄로 입력 값을 정수 배열로 변환했습니다. 이 방식은 코드를 매우 간결하게 만들어 줍니다.
- **Math.Min 중첩 사용**: w - x, x, h - y, y 네 가지 값 중에서 가장 작은 값을 한 번에 찾는 방법입니다. Math.Min을 중첩해서 사용하거나, C# 7.0 이상에서는 \*\*Math.Min(a, b, c, d)\*\*와 같이 여러 인수를 받는 오버로딩이 없으므로, **Math.Min을 두 번 중첩**하여 사용하면 코드가 간결해집니다.

이러한 변경을 통해 코드가 더 효율적이고 가독성이 높아집니다.

---

1. 이전에 게임 개발할때 대부분의 값을 float로 사용해서 습관성Mathf 사용

2. split과 Select를 사용하여 한 줄로 입력 값 저장

3. Min의 중첩사용을 통한 코드 간략화.
