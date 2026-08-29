---
title: "[C#] 타르코프(Tarkov) NVIDIA 설정 원클릭 자동화 프로그램 만들기"
slug: "tistory-48"
description: "안녕하세요. 이스케이프 프롬 타르코프(Escape from Tarkov)를 즐기는 유저라면 적을 더 잘 식별하기 위해(색적) 엔비디아 제어판 설정을 건드려본 경험이 있으실 겁니다. 특히 제가 이전에 작성한 게시물을 통해 레이드 환경에 맞추어 nvidia 설정을 변경하고 계실 수 있습니다"
date: 2025-12-11
category: "C#"
tags: [C#, nvidia, 그래픽 옵션 설정, 타르코프]
source: "https://bluehamster.tistory.com/48"
thumbnail: "/blog/images/tistory-48/img1.png"
---


안녕하세요.

이스케이프 프롬 타르코프(Escape from Tarkov)를 즐기는 유저라면 적을 더 잘 식별하기 위해(색적) 엔비디아 제어판 설정을 건드려본 경험이 있으실 겁니다.

특히 제가 이전에 작성한 게시물을 통해 레이드 환경에 맞추어 nvidia 설정을 변경하고 계실 수 있습니다.

<https://bluehamster.tistory.com/47>

[[Escape from Tarkov] 타르코프 전용 엔비디아(NVIDIA) 설정법

이스케이프 프롬 타르코프(Tarkov)를 즐기시는 분들이라면 누구나 한 번쯤 겪는 상황이 있습니다. 분명 소리는 들리는데 어두운 그림자나 칙칙한 풀숲 색깔 때문에 적을 찾지 못해 로비로 사출되

bluehamster.tistory.com](https://bluehamster.tistory.com/47)

디지털 바이브런스(Digital Vibrance)를 높이고 감마 값을 조절하면 어두운 곳에 숨은 적은 잘 보이지만, 게임이 끝나고 웹서핑이나 유튜브를 볼 때는 화면이 너무 눈부시고 색감이 과장되어 눈이 아픈 문제가 있습니다.

매번 제어판을 열어서 설정을 바꾸기는 너무 번거롭습니다.

그래서 오늘은 **C#을 이용해 게임용 설정과 기본 설정을 단 1초 만에 전환하는 자동화 프로그램**을 만드는 방법을 공유합니다.

### 1. 프로그램의 원리

이 프로그램은 두 가지 핵심 기술을 사용합니다.

**NVIDIA Digital Vibrance 제어** NvAPIWrapper라는 라이브러리를 사용하여 GPU 레벨에서 색조(Vibrance)를 조절합니다.

**Windows 감마 램프(Gamma Ramp) 제어** Win32 API인 gdi32.dll의 SetDeviceGammaRamp 함수를 사용합니다. 이를 통해 소프트웨어적으로 모니터의 감마, 대비, 밝기를 조절할 수 있습니다. 특히 CreateDC 함수를 사용하여 주 모니터를 특정하여 제어하므로 멀티 모니터 환경에서도 안전합니다.

### 2. 준비물

- Visual Studio (Console App 프로젝트 생성)
- NuGet 패키지: **NvAPIWrapper.Net** (이 패키지를 설치해야 NVIDIA GPU 제어가 가능합니다.)

### 3. 전체 소스 코드

아래 코드를 복사하여 Program.cs에 붙여넣으세요. 상단의 **[설정값]** 부분에서 본인 모니터와 취향에 맞는 수치를 입력하면 됩니다.

```
using System;
using System.Runtime.InteropServices;
using NvAPIWrapper;
using NvAPIWrapper.Display;

namespace NvidiaSwitcher
{
    class Program
    {
        // ==========================================
        // [설정값] 본인의 취향에 맞게 수정하세요
        // ==========================================
        static int Game_Vibrance = 60;        // 게임용 바이브런스
        static float Game_Gamma = 1.50f;      // 게임용 감마 (높을수록 밝아짐)
        static float Game_Contrast = 0.65f;   // 게임용 대비
        static float Game_Brightness = 0.50f; // 게임용 밝기

        static int Default_Vibrance = 50;     // 기본 바이브런스 (보통 50)
        static float Default_Gamma = 1.0f;    // 기본 감마 (보통 1.0)
        static float Default_Contrast = 0.5f; // 기본 대비
        static float Default_Brightness = 0.5f; // 기본 밝기

        // ==========================================
        // [Win32 API] 화면 제어를 위한 필수 선언
        // ==========================================
        [DllImport("gdi32.dll", CharSet = CharSet.Ansi)]
        public static extern IntPtr CreateDC(string lpszDriver, string lpszDevice, string lpszOutput, IntPtr lpInitData);

        [DllImport("gdi32.dll")]
        public static extern bool DeleteDC(IntPtr hdc);

        [DllImport("gdi32.dll")]
        public static extern bool SetDeviceGammaRamp(IntPtr hDC, ref RAMP lpRamp);

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
        public struct RAMP
        {
            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
            public UInt16[] Red;
            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
            public UInt16[] Green;
            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
            public UInt16[] Blue;
        }

        static void Main(string[] args)
        {
            try
            {
                NVIDIA.Initialize();
                Console.WriteLine("1. NVIDIA 초기화 성공");
            }
            catch (Exception ex)
            {
                Console.WriteLine("!! NVIDIA 초기화 실패: " + ex.Message);
                return;
            }

            var displays = Display.GetDisplays();
            if (displays.Length == 0)
            {
                Console.WriteLine("!! 모니터를 찾을 수 없습니다.");
                return;
            }

            // 첫 번째 모니터 타겟팅
            var targetDisplay = displays[0];
            Console.WriteLine($"2. 타겟 모니터: {targetDisplay.Name}");

            string mode = "default";
            if (args.Length > 0) mode = args[0].ToLower();

            Console.WriteLine($"--- 모드 적용 시작: {mode} ---");

            if (mode == "game")
            {
                ApplySettings(targetDisplay, Game_Vibrance, Game_Gamma, Game_Contrast, Game_Brightness);
            }
            else
            {
                // default 또는 인자가 없을 경우 기본값 복구
                ApplySettings(targetDisplay, Default_Vibrance, Default_Gamma, Default_Contrast, Default_Brightness);
            }
        }

        static void ApplySettings(Display display, int vibrance, float gamma, float contrast, float brightness)
        {
            // 1. 바이브런스 (NVIDIA)
            try
            {
                display.DigitalVibranceControl.CurrentLevel = vibrance;
                Console.WriteLine($"[성공] 바이브런스 변경 완료: {vibrance}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[실패] 바이브런스 오류: {ex.Message}");
            }

            // 2. 감마/대비/밝기 (Win32)
            bool result = SetDisplayColors(display.Name, gamma, contrast, brightness);

            if (result)
                Console.WriteLine($"[성공] 감마/대비/밝기 적용 완료");
            else
                Console.WriteLine($"[실패] 감마/대비/밝기 적용 실패 (야간모드/HDR 확인 필요)");
        }

        static bool SetDisplayColors(string deviceName, float gamma, float contrast, float brightness)
        {
            RAMP ramp = new RAMP();
            ramp.Red = new UInt16[256];
            ramp.Green = new UInt16[256];
            ramp.Blue = new UInt16[256];

            for (int i = 0; i < 256; i++)
            {
                double val = i / 255.0;
                // 감마 보정 공식 적용
                val = Math.Pow(val, 1.0 / gamma);

                // 대비 적용
                double contrastFactor = contrast * 2.0;
                val = (val - 0.5) * contrastFactor + 0.5;

                // 밝기 적용
                val += (brightness - 0.5);

                // 클램핑 (0.0 ~ 1.0 사이 값 유지)
                if (val < 0.0) val = 0.0;
                if (val > 1.0) val = 1.0;

                ramp.Red[i] = ramp.Green[i] = ramp.Blue[i] = (UInt16)(val * 65535);
            }

            // DC 생성 및 램프 적용
            IntPtr dc = CreateDC(null, deviceName, null, IntPtr.Zero);
            if (dc == IntPtr.Zero) return false;

            bool result = SetDeviceGammaRamp(dc, ref ramp);
            DeleteDC(dc); // 리소스 해제
            return result;
        }
    }
}
```

### 4. 사용 방법

빌드하여 생성된 exe 파일을 사용하여 간편하게 모드를 전환할 수 있습니다.

**게임 모드 적용:** 명령 프롬프트(CMD)나 바로가기 설정에서 뒤에 game 인자를 붙여 실행합니다. NvidiaSwitcher.exe game

**기본 모드 복구:** 인자 없이 실행하거나 default를 붙여 실행합니다. NvidiaSwitcher.exe default

**팁:** 바탕화면에 바로가기를 두 개 만들고, 각각 **속성 > 대상** 끝에 game과 default를 적어두면 더블 클릭 한 번으로 설정을 변경할 수 있습니다. 혹은 스트림덱(Stream Deck)과 연동하면 물리 버튼 하나로 화면 전환이 가능해집니다.

![](/blog/images/tistory-48/img1.png)

### 마치며

이 프로그램을 사용하면 타르코프 인게임(PostFX) 설정만으로는 부족했던 시인성을 그래픽카드 드라이버 레벨에서 확보할 수 있습니다.

게임이 끝나면 다시 눈이 편안한 기본 화면으로 즉시 돌아올 수도 있죠.

개발자라면 불편함을 코드로 해결하는 것이 진정한 재미 아니겠습니까? 직접 빌드해서 사용해 보시길 추천합니다.
