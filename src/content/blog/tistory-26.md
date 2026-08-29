---
title: "설탕 배달 (백준) / C#"
slug: "tistory-26"
description: "https://www.acmicpc.net/problem/2839 문제상근이는 요즘 설탕공장에서 설탕을 배달하고 있다. 상근이는 지금 사탕가게에 설탕을 정확하게 N킬로그램을 배달해야 한다. 설탕공장에서 만드는 설탕은 봉지에 담겨져 있다. 봉지는 3킬로그램 봉지와 5킬로그램 봉지가 있다."
date: 2025-09-26
category: "이관 글"
tags: [이관]
source: "https://bluehamster.tistory.com/26"
---


<https://www.acmicpc.net/problem/2839>

## 문제

상근이는 요즘 설탕공장에서 설탕을 배달하고 있다. 상근이는 지금 사탕가게에 설탕을 정확하게 N킬로그램을 배달해야 한다. 설탕공장에서 만드는 설탕은 봉지에 담겨져 있다. 봉지는 3킬로그램 봉지와 5킬로그램 봉지가 있다.

상근이는 귀찮기 때문에, 최대한 적은 봉지를 들고 가려고 한다. 예를 들어, 18킬로그램 설탕을 배달해야 할 때, 3킬로그램 봉지 6개를 가져가도 되지만, 5킬로그램 3개와 3킬로그램 1개를 배달하면, 더 적은 개수의 봉지를 배달할 수 있다.

상근이가 설탕을 정확하게 N킬로그램 배달해야 할 때, 봉지 몇 개를 가져가면 되는지 그 수를 구하는 프로그램을 작성하시오.

## 입력

첫째 줄에 N이 주어진다. (3 ≤ N ≤ 5000)

## 출력

상근이가 배달하는 봉지의 최소 개수를 출력한다. 만약, 정확하게 N킬로그램을 만들 수 없다면 -1을 출력한다.

## 예제 입력 1

```
18
```

## 예제 출력 1

```
4
```

## 예제 입력 2

```
4
```

## 예제 출력 2

```
-1
```

---

처음 5로 나눴을 때 나머지가 없으면 나눈 값의 몫이 정답

그렇지 않을 경우 5의 몫을 1씩 줄이고 나머지의 값을 3으로 나눴을때 나머지 값이 0이면

5의 값과, 3의 값을 합치면 정답

5가 0일때 3으로 나누어도 나머지가 존재 한다면 -1 출력.

```
public class Canvas
{
    public static void Main(string[] args)
    {
        int kilogram = int.Parse(Console.ReadLine());
        int fivecount = 0;
        int threecount = 0;
        if (kilogram % 5 == 0)
        {
            fivecount = kilogram / 5;
            threecount = 0;
        }
        else
        {
            int FirstDiv = kilogram / 5;

            for (int i = FirstDiv; i >= 0; i--)
            {
                int restDiv = kilogram - (i*5);
                if (restDiv % 3 == 0)
                {
                    fivecount = i;
                    threecount = restDiv / 3;
                    break;
                }
            }
        }
        if (fivecount == 0 && threecount == 0) threecount = -1;
        Console.WriteLine(fivecount + threecount);
        }
}
```

---

AI 잼미니 개선 버전

전반적으로 그리디 알고리즘의 핵심 아이디어를 잘 적용해서 문제를 올바르게 해결하셨습니다. 👍 아주 잘하셨어요! 여기서 몇 가지 개선점을 통해 코드를 더 간결하고 명확하게 다듬을 수 있습니다.

---

### 개선할 점 💡

#### 1. 초기 if (kilogram % 5 == 0) 블록은 없애도 괜찮아요.

현재 코드는 5로 나누어떨어지는 경우를 if문으로 먼저 처리하고, 그렇지 않은 경우 else 블록에서 for문으로 처리합니다.

사실 **for문은 5로 나누어떨어지는 경우를 이미 포함**하고 있습니다. for문의 첫 번째 반복(i = FirstDiv)에서 restDiv는 kilogram % 5와 같은데, 만약 kilogram이 5의 배수라면 restDiv는 0이 되고, 0 % 3 == 0은 참이므로 어차피 올바른 답을 찾게 됩니다.

따라서 초기 if-else 구조를 하나로 합쳐 코드를 더 간결하게 만들 수 있습니다.

#### 2. 해를 찾지 못했을 때의 처리

현재 if (fivecount == 0 && threecount == 0) 코드로 -1을 처리하고 있습니다. 이 방법도 동작은 하지만, 입력값이 4나 7일 때 fivecount와 threecount가 초기값 0에서 변하지 않는다는 점을 이용한 것입니다.

만약 해를 찾았는지 여부를 나타내는 **boolean 플래그 변수**를 사용하거나, **결과 변수의 초기값을 -1**로 두면 의도가 더 명확해집니다.

```
using System;

public class Program
{
    public static void Main(string[] args)
    {
        int kilogram = int.Parse(Console.ReadLine());
        int count = 0;

        while (kilogram >= 0)
        {
            // 1. 5로 나누어 떨어지면, 최적의 해를 찾은 것!
            if (kilogram % 5 == 0)
            {
                count += kilogram / 5;
                Console.WriteLine(count);
                return; // 프로그램 종료
            }

            // 2. 5로 안 나누어 떨어지면, 3kg 봉지를 하나 썼다고 가정하고 3을 뺀다.
            kilogram -= 3;
            count++;
        }

        // 3. while문이 끝났다는 것은, 3을 계속 빼다 음수가 되었다는 의미. (정확히 나눌 수 없음)
        Console.WriteLine(-1);
    }
}
```

- **로직 설명**:
  1. N 킬로그램이 5로 나누어 떨어지는지 먼저 확인합니다. 그렇다면 그게 최적의 해입니다. (예: N=20 -> 5kg\*4)
  2. 나누어 떨어지지 않으면, 3kg 봉지를 하나 썼다고 가정하고 N에서 3을 뺍니다. (예: N=18 -> 15 -> 12 ...)
  3. 이 과정을 N이 0 이상일 동안 계속 반복합니다. while문 중간에 5의 배수를 만나면 그 즉시 계산하고 종료합니다.
  4. while문이 끝까지 돌았다면 (N이 음수가 됨) 정확하게 만들 수 없는 경우이므로 -1을 출력합니다.
