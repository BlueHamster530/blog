---
title: "핸드폰 요금 (백준) / C#"
slug: "tistory-31"
description: "https://www.acmicpc.net/problem/1267 문제동호는 새악대로 T 통신사의 새 핸드폰 옴머나를 샀다. 새악대로 T 통신사는 동호에게 다음 두 가지 요금제 중 하나를 선택하라고 했다.영식 요금제민식 요금제영식 요금제는 30초마다 10원씩 청구된다. 이 말은 만약 2"
date: 2025-10-14
category: "코딩테스트"
tags: [이관]
source: "https://bluehamster.tistory.com/31"
---


<https://www.acmicpc.net/problem/1267>

## 문제

동호는 새악대로 T 통신사의 새 핸드폰 옴머나를 샀다. 새악대로 T 통신사는 동호에게 다음 두 가지 요금제 중 하나를 선택하라고 했다.

1. 영식 요금제
2. 민식 요금제

영식 요금제는 30초마다 10원씩 청구된다. 이 말은 만약 29초 또는 그 보다 적은 시간 통화를 했으면 10원이 청구된다. 만약 30초부터 59초 사이로 통화를 했으면 20원이 청구된다.

민식 요금제는 60초마다 15원씩 청구된다. 이 말은 만약 59초 또는 그 보다 적은 시간 통화를 했으면 15원이 청구된다. 만약 60초부터 119초 사이로 통화를 했으면 30원이 청구된다.

동호가 저번 달에 새악대로 T 통신사를 이용할 때 통화 시간 목록이 주어지면 어느 요금제를 사용 하는 것이 저렴한지 출력하는 프로그램을 작성하시오.

---

## 입력

동호가 저번 달에 이용한 통화의 개수 N이 주어진다. N은 20보다 작거나 같은 자연수이다. 둘째 줄에 통화 시간 N개가 주어진다. 통화 시간은 10,000보다 작거나 같은 자연수이다.

## 출력

첫째 줄에 싼 요금제의 이름을 출력한다. 그 후에 공백을 사이에 두고 요금이 몇 원 나오는지 출력한다. 만약 두 요금제의 요금이 모두 같으면 영식을 먼저 쓰고 민식을 그 다음에 쓴다.

영식은 Y로, 민식은 M으로 출력한다.

## 예제 입력 1

```
3
40 40 40
```

## 예제 출력 1

```
M 45
```

- 영식: 20 + 20 + 20 = 60
- 민식: 15 + 15 + 15 = 45

## 예제 입력 2

```
3
61 61 61
```

## 예제 출력 2

```
Y M 90
```

---

### 자체 풀이

매우 간단한 계산 비교 연산으로

각 통화 시간을 요금 계산 기준으로 나눈 후 요금 금액 만큼 곱하여 나온 각각의 금액을 비교하여 출력.

((통화 시간 / 계산 기준 시간 ) + 1 ) \* (기준 요금) = 통화 1번당 나오는 요금

 +1를 하는 이유 : 1초라도 통화를 했다면 기본 요금이 나오기도 하기 때문

```csharp
public class Canvas
{
    public static int totalYMoney(int[] values)
    {
        int result = 0;
        for (int i = 0; i < values.Length; i++)
        {
            result += ((values[i] / 30) + 1) * 10;
        }
        return result;
    }
    public static int totalMMoney(int[] values)
    {
        int result = 0;
        for(int i = 0; i < values.Length; i ++)
        {
            result += ((values[i]/60) + 1) *15;
        }
        return result;
    }
    public static void Main(string[] args)
    {
        int CallNumber = int.Parse(Console.ReadLine());
        string[] calltimestring = Console.ReadLine().Split(' ') ;
        int[] calltimes= new int[calltimestring.Length];
        
        for (int i = 0; i < calltimes.Length; i++)
        {
            calltimes[i] = int.Parse(calltimestring[i]);
        }
        int Ymoney = totalYMoney(calltimes);
        int Mmoney = totalMMoney(calltimes);

        if (Ymoney == Mmoney)
        {
            Console.WriteLine("Y M " + Ymoney);
        }
        else if (Ymoney > Mmoney)
        {
            Console.WriteLine("M " + Mmoney);
        }
        else if (Ymoney < Mmoney)
        {
            Console.WriteLine("Y " + Ymoney);
        }
    }
}
```

---

### AI 잼미니 개선 버전

안녕하세요! 제출하신 코드는 문제의 요구사항을 정확히 이해하고 올바르게 구현한 **좋은 코드**입니다. 👍

다만, 몇 가지 부분을 개선하면 더 효율적이고 간결한 코드로 만들 수 있습니다.

---

### **핵심 개선사항: 반복문 통합**

가장 큰 개선점은 **계산 과정을 하나의 반복문으로 합치는 것**입니다.

현재 코드는 영식 요금(Y)과 민식 요금(M)을 계산하기 위해 통화 시간 배열(calltimes)을 totalYMoney와 totalMMoney 메소드에서 각각 한 번씩, 총 두 번 순회합니다. 문제의 조건에서는 통화 개수가 최대 20개라 큰 차이가 없지만, 데이터가 많아질 경우를 대비해 하나의 반복문으로 처리하는 습관을 들이는 것이 좋습니다.

**개선 아이디어**

- Ymoney와 Mmoney 변수를 0으로 초기화합니다.
- 통화 시간 배열을 **한 번만** 순회하면서, 각 통화 시간에 대한 Y 요금과 M 요금을 계산하여 각각의 변수에 더해줍니다.

이렇게 하면 불필요한 반복을 줄여 코드가 더 빨라집니다.

---

### **기타 개선사항**

1. **불필요한 변수 제거**: 첫 줄에서 입력받는 통화의 개수(CallNumber)가 실제 코드에서는 calltimes.Length로 대체되어 사용되지 않고 있습니다. 사용하지 않는 변수는 혼란을 줄 수 있으므로 제거하는 것이 좋습니다.
2. **간결한 입력 처리 (LINQ 사용)**: C#의 Array.ConvertAll 이나 LINQ의 Select를 사용하면 문자열 배열을 정수 배열로 변환하는 for 반복문을 한 줄로 줄일 수 있습니다.
3. C#

   ```csharp
   // 기존 코드
   string[] calltimestring = Console.ReadLine().Split(' ');
   int[] calltimes = new int[calltimestring.Length];
   for (int i = 0; i < calltimes.Length; i++)
   {
       calltimes[i] = int.Parse(calltimestring[i]);
   }

   // 개선된 코드 (한 줄로 변경)
   int[] calltimes = Array.ConvertAll(Console.ReadLine().Split(' '), int.Parse);
   ```

---

### **개선된 전체 코드 예시**

위 개선사항들을 반영한 전체 코드는 다음과 같습니다.

C#

```csharp
using System;

public class Program // 클래스 이름을 더 일반적인 Program으로 변경
{
    public static void Main(string[] args)
    {
        // 사용하지 않는 통화 개수 입력(ReadLine) 제거
        int.Parse(Console.ReadLine()); 
        
        // Array.ConvertAll을 사용하여 입력을 한 줄로 처리
        int[] calltimes = Array.ConvertAll(Console.ReadLine().Split(' '), int.Parse);

        int yMoney = 0;
        int mMoney = 0;

        // 반복문을 하나로 통합하여 Y 요금과 M 요금을 동시에 계산
        foreach (int time in calltimes)
        {
            yMoney += ((time / 30) + 1) * 10;
            mMoney += ((time / 60) + 1) * 15;
        }

        if (yMoney < mMoney)
        {
            Console.WriteLine("Y " + yMoney);
        }
        else if (mMoney < yMoney)
        {
            Console.WriteLine("M " + mMoney);
        }
        else // yMoney == mMoney
        {
            Console.WriteLine("Y M " + yMoney);
        }
    }
}
```

**요약:**

- **정확성**: 기존 코드의 로직은 완벽합니다.
- **효율성**: 반복문을 하나로 합쳐 코드의 실행 속도를 개선했습니다.
- **간결성**: 불필요한 변수를 제거하고 LINQ를 활용해 코드를 더 짧고 깔끔하게 만들었습니다.

지금도 충분히 잘하셨지만, 이런 작은 개선들이 쌓여 더 좋은 코드를 만드는 기반이 됩니다. 계속 화이팅하세요! 😊

---

너무 풀어 해석하여 작성 하는 습관이 있어 반복문을 합쳐서 일괄적으로 작업할 수 있음에도 놓치는 부분이 많음.

또한 LINQ를 적극적으로 활용하기 위해 추가적인 공부가 필요함.

기존 c# 에서 nodejs로 직무 변경 공부를 진행 중에 있으므로 추후 코딩테스트도 c#이 아닌 nodejs 으로 진행할 수 있도록

노력이 필요함.
