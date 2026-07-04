# DevLee — 오늘뭐먹(whatimeat)

앱인토스(Apps in Toss) 미니앱. React 18 + TypeScript + Vite, `@apps-in-toss/web-framework`(Granite) 기반.

다이어트(단기/장기 목적 무관)를 하는 사람들이 식단관리를 재미있게 할 수 있도록 돕는 게 목적. 단순 기록 앱이 아니라 캐릭터 성장, 미션, 넛지 팝업 같은 게임 요소로 습관 형성을 유도하는 방향으로 만들고 있음.

## 명령어

- `npm run dev` — 로컬 개발 서버 (`granite dev`)
- `npm run build` — 빌드 (`ait build`)
- `npm run deploy` — 앱인토스에 배포 (`ait deploy`)
- `npm run lint` / `npm run format` — eslint / prettier

### 실기기(샌드박스 앱) 테스트

카메라 등 네이티브 SDK는 브라우저 미리보기에서 동작하지 않아 실기기 확인이 필요함. `granite.config.ts`의 `web.host`를 로컬 네트워크 IP로, `web.commands.dev`를 `"vite dev --host"`로 설정해두면 `npm run dev` 실행 시 로컬 네트워크에 서버가 노출됨. 샌드박스 앱에서 `intoss://whatimeat` 스킴으로 접속. IP는 개발 기기마다 달라지므로 `ifconfig`/`ipconfig getifaddr en0`로 매번 확인 후 값을 맞출 것

### 변경사항 검증 방법

- 코드 변경 후 `npx tsc --noEmit -p tsconfig.app.json`, `npm run lint`, `npm run build`로 확인
- UI 변경은 `npm run dev` 브라우저 미리보기로 먼저 확인. 단, 카메라/앨범/`Storage` 등 네이티브 SDK는 브라우저 브릿지가 없어서 항상 실패하는 게 정상(에러 발생 → 알림 다이얼로그로 처리되는지만 확인하면 됨)
- 실제 네이티브 동작(사진 촬영, 로컬 저장 등)은 샌드박스 앱에서만 검증 가능

## 구조

- `src/App.tsx` — 진입 컴포넌트. 라우터 없이 `useState`로 페이지 전환(`page` 상태값에 따라 조건부 렌더링)
- `src/pages/` — 화면 단위 컴포넌트. `onBack` prop으로 이전 화면 복귀 처리
- `src/hooks/` — 기능별 로직(광고, 인앱결제 등)을 커스텀 훅으로 분리. 앱인토스 SDK 호출은 훅 안에 캡슐화
- `granite.config.ts` — 앱 이름/브랜드 색상/권한 등 미니앱 설정. `brand.icon`은 로컬 dev 서버 주소(`http://<IP>:5173/파일명`) 기준이라 IP가 바뀌거나 실제 배포할 때 다시 갱신 필요. 다크모드 아이콘은 코드가 아니라 앱인토스 콘솔에서 별도 업로드
- `docs/skills/apps-in-toss.md`, `docs/skills/tds-mobile.md` — 앱인토스 API·TDS 컴포넌트 전체 레퍼런스. 분량이 커서 상시 로드하지 않음. 특정 API/컴포넌트 사용법이 필요할 때만 열어서 확인할 것

## 핵심 기능 — 식단 기록 (`src/pages/MealLogPage.tsx`)

- **사진 기록**: 카메라 촬영 또는 앨범 선택(`useMealPhotoCapture`)으로 식단 사진을 남기고, 메모 입력(`useMealMemoPrompt`, 비워두면 랜덤 코멘트 자동 적용). 기록은 `useMealLog`가 `Storage`(기기 로컬 저장소)에만 저장 — **서버 없음, 기기 간 동기화 안 됨**
- **넛지 팝업**(`useMealNudge`): 페이지가 열려있는 동안 랜덤 간격(45~90초)으로 "혹시 뭐 먹고 있는 거 아니지?" 팝업을 띄워 기록을 유도. 앱을 나가있거나 꺼놨을 때 오는 백그라운드 푸시는 아님
- **연속 기록 스트릭**(`useMealStreak`): 기록 날짜 기준으로 오늘부터 거슬러 연속 기록일수 계산
- **성장 단계 캐릭터**(`useMealGrowth`): 총 기록 개수로 Lv.1(씨앗)~Lv.4(열매) 단계 결정, `public/Level1~4.png` 일러스트로 표시
- **오늘의 미션**(`useMealMission`): 날짜별로 랜덤 미션 문구 하나를 로컬에 저장, "완료했어요" 버튼은 자기신고 방식(실제 이행 여부 검증 불가)

## 남은 기능 / 알려진 제약

- **AI 성분분석/칼로리 인식** — 미구현. 백엔드(서버리스 함수 등) 없이는 API 키를 안전하게 다룰 수 없어서 서버 도입이 선행되어야 함
- **소셜/공유, 기기 간 동기화** — 미구현. 둘 다 서버 필요
- **인앱광고/인앱결제**(`InAppAdsPage.tsx` 등) — 테스트용 ID만 있는 상태, 배포 전 실제 ID로 교체 필요 (`TODO` 주석 참고)
- **수익화** — 리워드형 광고를 미션/기록 보상과 연동하는 방향으로 논의만 되고 코드는 미착수

## 컨벤션

- UI는 `@toss/tds-mobile`(TDS) 컴포넌트를 사용. 색상은 `@toss/tds-colors`의 `colors`/`adaptive` 사용
- 앱인토스 SDK(`@apps-in-toss/web-framework`) 기능은 페이지에서 직접 부르지 않고 `src/hooks`의 커스텀 훅으로 감싸서 사용
- 테스트용 광고그룹 ID처럼 실제 배포 전 교체가 필요한 값은 `TODO` 주석으로 표시되어 있음 (예: `InAppAdsPage.tsx`)

## 협업 규칙

- 앱 기능(페이지, 훅, 설정 등)을 수정했다면 관련 내용을 이 CLAUDE.md에도 함께 반영할 것. 코드만 바꾸고 문서를 그대로 두지 말 것
- 파일 수정은 한 줄씩 나눠서 여러 번 편집하지 말고, 변경 내용을 모아 한 번에 적용할 것
- 모든 답변과 코드 주석은 한글로 작성할 것. 라이브러리/프레임워크 이름, 코드 식별자, 공식 용어 등 영어로 써야만 의미가 통하는 경우에만 예외적으로 영어를 사용할 것
- 사용자가 입력한 프롬프트에 대해 바로 구현부터 하지 말 것. 먼저 어떻게 할지 설명하거나 확인받고 나서 진행할 것
- 수정을 거칠 때마다(기능/설정 변경을 마칠 때마다) git 커밋과 origin push까지 진행할 것
