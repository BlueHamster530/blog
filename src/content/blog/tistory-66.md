---
title: "[백엔드 공부] 코드를 분리해야 하는 이유: 레이어드 아키텍처(Layered Architecture) 완벽 정리"
slug: "tistory-66"
description: "백엔드 개발을 공부하면서 가장 먼저 부딪히는 벽 중 하나는 '도대체 이 코드를 어디에 써야 하는가?'입니다. 단순히 main 함수나 하나의 파일에 모든 로직을 때려 넣으면 당장은 편하지만, 프로젝트가 조금만 커져도 유지보수가 불가능해집니다.오늘은 백엔드 시스템을 설계할 때 가장 기본이 "
date: 2026-01-26
category: "서버 개발"
tags: [이관]
source: "https://bluehamster.tistory.com/66"
thumbnail: "/blog/images/tistory-66/img1.png"
---


백엔드 개발을 공부하면서 가장 먼저 부딪히는 벽 중 하나는 **"도대체 이 코드를 어디에 써야 하는가?"**입니다. 단순히 main 함수나 하나의 파일에 모든 로직을 때려 넣으면 당장은 편하지만, 프로젝트가 조금만 커져도 유지보수가 불가능해집니다.

오늘은 백엔드 시스템을 설계할 때 가장 기본이 되는 **레이어드 아키텍처**에 대해, 왜 쓰는지 그리고 어떻게 구현하는지 예시와 함께 정리해 보았습니다.

---

## 1. 레이어드 아키텍처란?

레이어드 아키텍처는 시스템을 유사한 관심사(Concern)를 가진 여러 개의 **계층(Layer)**으로 수평적으로 분리하여 구성하는 아키텍처 패턴입니다.

쉽게 말해 **"각자 맡은 역할만 확실하게 하자"**는 것입니다. 식당에 비유하자면 다음과 같습니다.

- **웨이터 (Controller):** 손님의 주문을 받고 주방에 전달합니다. (요리를 직접 하지 않음)
- **셰프 (Service):** 주문받은 레시피대로 요리를 만듭니다. (재료를 직접 농사짓지 않음)
- **창고 관리자 (Repository):** 셰프가 요청한 재료를 냉장고에서 꺼내줍니다.

일반적으로 백엔드에서는 **3-Tier (Controller - Service - Repository)** 구조를 가장 많이 사용합니다.

![](/blog/images/tistory-66/img1.png)

---

## 2. 각 레이어의 역할 상세 분석

### ① 프레젠테이션 계층 (Presentation Layer / Controller)

시스템의 최전방에서 사용자의 요청(Request)을 받아들이고, 처리 결과를 응답(Response)해주는 역할을 합니다.

- **주요 역할:**
  - 클라이언트의 요청 엔드포인트(URL) 매핑
  - 요청 데이터(Parameter, Body)의 유효성 검증
  - 비즈니스 계층(Service)으로 요청 전달
  - 처리 결과를 클라이언트에게 적절한 형태(JSON 등)로 반환
- **주의점:** 절대 여기에 비즈니스 로직(이율 계산, 회원 등급 변경 등)을 넣으면 안 됩니다.

### ② 비즈니스 계층 (Business Layer / Service)

애플리케이션의 핵심 로직을 담당하는 계층입니다.

**'트랜잭션(Transaction)'**의 단위가 되며, 실제 업무 규칙이 이곳에서 수행됩니다.

- **주요 역할:**
  - 구체적인 업무 로직 수행 (예: 송금 시 잔액 확인 후 차감 및 입금)
  - 트랜잭션 관리 (도중에 실패하면 모두 롤백)
  - 데이터 계층(Repository) 호출
- **주의점:** 웹 기술(HttpServletRequest 등)이나 DB 기술(SQL 등)에 종속되지 않고 순수한 자바/객체 로직으로 작성하는 것이 좋습니다.

### ③ 데이터 접근 계층 (Persistence Layer / Repository)

데이터베이스(DB)에 실제로 접근하여 데이터를 저장, 조회, 수정, 삭제(CRUD)하는 역할을 합니다.

- **주요 역할:**
  - DB와의 연결 관리
  - SQL 쿼리 실행 또는 ORM(JPA 등)을 통한 데이터 조작
  - 엔티티(Entity) 객체 반환

---

## 3. 코드 예시 (Spring Boot 기반)

'회원 가입' 기능을 만든다고 가정하고, 레이어드 아키텍처가 적용된 코드를 살펴보겠습니다.

### 1) Controller (주문 받기)

```csharp
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService; // Service를 의존

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserDto userDto) {
        // 1. 요청 받기 및 검증 (여기서는 생략)
        
        // 2. 셰프(Service)에게 요리(가입 처리) 요청
        userService.registerUser(userDto);
        
        // 3. 결과 응답
        return ResponseEntity.ok("회원가입 성공");
    }
}
```

### 2) Service (요리 하기)

```csharp
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository; // Repository를 의존

    @Transactional // 트랜잭션 관리
    public void registerUser(UserDto dto) {
        // 1. 비즈니스 로직: 중복 회원 검사
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }

        // 2. 비즈니스 로직: 비밀번호 암호화 등 (생략)

        // 3. 창고 관리자(Repository)에게 저장 요청
        User user = new User(dto.getEmail(), dto.getPassword());
        userRepository.save(user);
    }
}
```

### 3) Repository (재료 꺼내기)

```
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // DB와 직접 대화하는 메서드들
    boolean existsByEmail(String email);
    User save(User user);
}
```

---

## 4. 왜 이렇게 나눠야 할까? (장점)

공부하면서 느낀, 레이어를 나누었을 때의 확실한 장점들입니다.

1. **관심사의 분리 (Separation of Concerns):** 각자 할 일만 하므로 코드를 파악하기 쉽습니다. DB 쿼리를 보고 싶으면 Repository만 보면 되고, 로직을 보고 싶으면 Service만 보면 됩니다.
2. **유지보수성:** 만약 DB를 MySQL에서 Oracle로 바꾼다면? Repository 계층만 수정하면 됩니다. Controller나 Service 코드는 건드릴 필요가 없습니다.
3. **테스트 용이성:** Service 로직을 테스트할 때, 실제 DB 없이 Repository를 '가짜 객체(Mock)'로 만들어 테스트하기 쉽습니다.

**재사용성:** 하나의 Service 로직을 웹(Controller)에서도 쓰고, 앱에서도 쓰고, 관리자 페이지에서도 가져다 쓸 수 있습니다.

---

## 5. 마치며: 단점은 없을까?

물론 단점도 있습니다. 아주 간단한 기능(예: 단순히 이름만 조회)을 만들 때도 Controller, Service, Repository, DTO 등 **만들어야 할 파일이 많아지는 '코드의 복잡성'**이 증가합니다.

하지만 백엔드 개발자로서 성장하려면, 프로젝트의 규모가 커질 것을 대비해 **구조를 잡는 습관**을 들이는 것이 필수적이라고 생각합니다. 처음엔 귀찮더라도 역할과 책임을 나누는 연습을 꼭 해보시길 바랍니다!
