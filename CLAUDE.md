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
- **크롬 기반 브라우저 미리보기로는 못 잡는 버그가 있음**: iOS WebKit(사파리)은 좁은 영역에서 텍스트가 잘리면 가독성을 위해 폰트 크기를 자동으로 부풀리는 동작(text size adjust/font boosting)이 있는데, 크로미움에는 이 동작 자체가 없어서 브라우저 미리보기에서는 절대 재현되지 않음. 실제로 식단 기록 리스트에서 문구 길이에 따라 폰트 크기가 들쭉날쭉해 보이는 문제로 발견됨 → `src/index.css`의 `:root`에 `-webkit-text-size-adjust: 100%`로 전역 비활성화해서 해결. 텍스트 크기 관련 이슈는 브라우저 미리보기가 정상이어도 샌드박스 앱에서 한 번 더 확인할 것

## 구조

- `src/App.tsx` — 진입 컴포넌트. 라우터 없이 `useState`로 페이지 전환(`page` 상태값에 따라 조건부 렌더링). 홈 화면은 Claude Design 프로토타입을 참고해 디자인 리뉴얼함(그라데이션 배경, 캐릭터+레벨 뱃지, 통계 카드 3개, CTA 카드 2개) — Granite 시작 템플릿의 개발자센터/커뮤니티 링크는 제거. 이후 시각적 디테일 다듬기: 기본 CTA 카드는 단색 대신 그라데이션+그림자, 통계 카드는 은은한 그림자, 캐릭터 뒤에는 반경 180px 원형 글로우(radial-gradient) 추가. 클릭 가능한 커스텀 div 요소들은 로컬 `usePressScale` 훅으로 누르면 살짝 축소되는 터치 피드백 적용(App.tsx/MealLogPage.tsx/LeaderboardPage.tsx 각 파일에 동일한 훅을 로컬로 중복 정의함 — 공용 훅으로 뺄 정도는 아니라고 판단). 홈 화면 하단의 "apps in toss" 로고는 앱인토스 공식 브랜딩 가이드상 필수 표기 요소가 아님을 확인하고 제거함(파트너사 자체 로고/이름/컬러 노출만 규정돼 있고, 앱인토스 자체 워드마크 표시 의무는 없음)
- `src/pages/` — 화면 단위 컴포넌트. `onBack` prop으로 이전 화면 복귀 처리
- `src/hooks/` — 기능별 로직(식단 기록, 랭킹 등)을 커스텀 훅으로 분리. 앱인토스 SDK 호출은 훅 안에 캡슐화
- `granite.config.ts` — 앱 이름/브랜드 색상/권한 등 미니앱 설정. `brand.icon`은 로컬 dev 서버 주소(`http://<IP>:5173/파일명`) 기준이라 IP가 바뀌거나 실제 배포할 때 다시 갱신 필요. 다크모드 아이콘은 코드가 아니라 앱인토스 콘솔에서 별도 업로드
- `docs/skills/apps-in-toss.md`, `docs/skills/tds-mobile.md` — 앱인토스 API·TDS 컴포넌트 전체 레퍼런스. 분량이 커서 상시 로드하지 않음. 특정 API/컴포넌트 사용법이 필요할 때만 열어서 확인할 것

## 핵심 기능 — 식단 기록 (`src/pages/MealLogPage.tsx`)

Claude Design 프로토타입 기반으로 디자인 리뉴얼함: 캐릭터+스트릭+진행률 바를 그라데이션 카드 하나로 통합, 촬영/앨범 버튼을 orange 채움/흰색 아웃라인 카드로 스타일링. 사진 기록의 실제 사진 썸네일은 프로토타입의 장식용 색상 원 대신 그대로 유지(실사용 가치가 더 크다고 판단). 홈으로 돌아가기는 화면 하단 화살표 버튼 대신 `Top`의 `right` 슬롯(`Top.RightButton`)에 배치해 제목 옆에 위치시킴(랭킹 화면도 동일). 기록 리스트의 코멘트는 CSS 픽셀 폭 기준 말줄임(ellipsis) 대신 `truncateComment`로 글자 수(24자) 기준으로 직접 잘라서 표시 — AI 분석 코멘트처럼 긴 문구가 기기/폰트에 따라 다르게 잘리는 것을 방지하고 항상 일정한 길이로 보이게 함. 단, 글자 수를 잘라도 실제 픽셀 폭까지 보장되진 않아서(폭 넓은 문자 조합 등) `overflow:hidden`+`textOverflow:ellipsis`를 안전장치로 같이 둠 — 이게 빠져있으면 코멘트가 길 때 수정/삭제 버튼 위치가 밀리는 문제가 있었음(우측 버튼 영역엔 `minWidth`+`flexShrink:0`도 추가해서 폭을 고정).

**포인트 컬러 오렌지→블루 전환**: `src/App.tsx`/`src/pages/MealLogPage.tsx`/`src/pages/LeaderboardPage.tsx`의 `colors.orange*` 토큰과 하드코딩된 오렌지 hex를 전부 동일 단계의 `colors.blue*`/블루 계열 hex로 교체함(삭제/에러용 `colors.red*`는 그대로 둠). `granite.config.ts`의 `brand.primaryColor`도 `#3B82F6`(블루)로 함께 변경 — 이 값이 TDS `Button`/`Top.RightButton` 등 color prop을 안 넘긴 컴포넌트의 기본 "primary" 컬러로 매핑되기 때문에, 코드에서 색을 직접 지정하지 않는 네이티브 UI 크롬(예: "홈으로" 버튼)까지 블루로 통일하려면 이 값도 같이 바꿔야 했음.

"내 동기화 코드 보기"/"다른 기기 연결하기"는 텍스트만 덩그러니 있던 `TextButton` 대신, blue50 배경의 pill 버튼 카드로 스타일링(다른 커스텀 버튼들과 동일하게 `usePressScale`로 눌림 피드백 적용).

- **사진 기록**: 카메라 촬영 또는 앨범 선택(`useMealPhotoCapture`)으로 식단 사진을 남기고, 메모 입력(`useMealMemoPrompt`, 비워두면 랜덤 코멘트 자동 적용). 기록은 `useMealLog`가 `whatimeat-server`의 `/api/meals`와 동기화됨 (아래 "백엔드" 섹션 참고)
- **AI 성분분석**(`useMealAnalysis`): 사진 촬영/선택 직후 `whatimeat-server`가 Claude Vision으로 분석한 코멘트(메뉴+대략적 칼로리)를 메모 입력창에 미리 채워줌. 사용자가 그대로 쓰거나 수정 가능, 분석 실패 시 빈 칸(랜덤 코멘트 대체)으로 자연스럽게 폴백
- **기기 인증**(`useDeviceAuth`): 앱 최초 실행 시 자동으로 서버에 익명 계정을 만들고 `access_token`/`sync_code`를 로컬에 저장. "내 동기화 코드 보기"/"다른 기기 연결하기" 버튼으로 다른 기기와 데이터 연결 가능 (`useSyncCodePrompt`)
- **넛지 팝업**(`useMealNudge`): 페이지가 열려있는 동안 랜덤 간격(45~90초)으로 "혹시 뭐 먹고 있는 거 아니지?" 팝업을 띄워 기록을 유도. 앱을 나가있거나 꺼놨을 때 오는 백그라운드 푸시는 아님
- **연속 기록 스트릭**(`useMealStreak`): 기록 날짜 기준으로 오늘부터 거슬러 연속 기록일수 계산
- **성장 단계 캐릭터**(`useMealGrowth`): 총 기록 개수로 Lv.1(씨앗)~Lv.4(열매) 단계 결정, `public/Level1~4.png` 일러스트로 표시. 원본 파일이 알파 채널 없이 체커보드 패턴이 픽셀로 박혀있던 문제를 발견해 실제 투명 배경으로 교체함 — 앞으로 이미지 생성 도구로 캐릭터를 추가하면 `sips -g hasAlpha 파일.png`로 알파 채널 유무를 먼저 확인할 것
- **오늘의 미션**(`useMealMission`): 날짜별로 랜덤 미션 문구 하나를 로컬에 저장. 자기신고형("물 한 잔 더 마시기" 등, "완료했어요" 버튼으로 직접 토글, 실제 이행 여부 검증 불가)과 자동판정형("오늘 기록 1개 남기기"/"연속 기록 3일 달성하기"/"이번 주 5끼 기록하기", `entries`/`streak` 데이터로 완료 여부 자동 계산, 버튼 없이 상태 뱃지만 표시) 두 종류를 섞어서 랜덤 출제 — 자동판정형만으로는 미션 문구 다양성이 부족하다고 판단해 두 방식을 병행하기로 함

## 핵심 기능 — 랭킹/친구 (`src/pages/LeaderboardPage.tsx`)

Claude Design 프로토타입 기반으로 디자인 리뉴얼함: 닉네임 유도 카드(다크 톤), 순위 배지(금/은/동 컬러), 리스트 항목을 개별 카드로 표시(공용 `RankCard`/`RankBadge`/`InitialAvatar` 컴포넌트).

- **닉네임**(`useNickname`, `useNicknamePrompt`): 닉네임을 설정해야 글로벌 랭킹에 노출됨(옵트인). 설정 안 해도 내 순위 조회는 가능
- **글로벌 랭킹**(`useLeaderboard`): 닉네임 설정한 사용자 중 누적 기록 개수 기준 상위 N명 + 내 순위
- **친구 비교**(`useFriends`): 동기화 코드(`useSyncCodePrompt` 재사용)로 친구 추가, 양방향 관계. 친구 목록도 기록 개수 기준 정렬

## 백엔드 (`whatimeat-server`, 별도 레포)

- 위치: `https://github.com/ljh3534/whatimeat-server` (devlee와 별도 레포 — devlee는 `ait deploy`, 서버는 레일웨이로 배포 방식이 근본적으로 달라서 분리함)
- 스택: Python + FastAPI + SQLAlchemy + Postgres(레일웨이 애드온), 마이그레이션은 Alembic
- **토스 로그인은 사용하지 않음** — 인앱결제/인앱광고/토스 로그인 전부 사업자 등록증이 필요한데, 사업자 등록을 할 계획이 없어서 사실상 앞으로도 안 쓸 예정
- 인증 대신 **익명 코드 시스템** 사용: `POST /api/auth/register`(가입+토큰 발급), `POST /api/auth/link`(다른 기기에서 sync_code로 연결), `GET /api/auth/me`. 모든 요청은 `Authorization: Bearer <access_token>` 헤더 필요
- 레일웨이 배포 완료, `/health` 정상 확인됨. `DATABASE_URL`은 레일웨이가 `postgresql://` 형태로 주는데, SQLAlchemy 기본 드라이버(psycopg2, 미설치)가 아니라 psycopg3를 쓰도록 `app/database.py`의 `normalize_database_url`에서 `postgresql+psycopg://`로 강제 변환함 (이 변환 없으면 배포 시 크래시)
- 로컬 개발 시 `DATABASE_URL` 없으면 SQLite로 자동 폴백
- `MealEntry` 동기화 API: `GET/POST /api/meals`, `PATCH`·`DELETE /api/meals/{id}` — 전부 인증 필요, 본인 소유 기록만 접근 가능
- 랭킹/친구 API: `PATCH /api/auth/me`(닉네임 설정), `GET /api/leaderboard`(닉네임 설정자만 노출, 누적 기록 수 기준), `GET /api/leaderboard/me`(내 순위), `POST`·`GET /api/friends`(동기화 코드로 친구 추가, 양방향)
- AI 분석 API: `POST /api/meals/analyze` (`app/ai.py`) — Claude Vision(기본 모델 Haiku, `CLAUDE_MODEL`로 변경 가능)으로 사진 분석. `ANTHROPIC_API_KEY` 환경변수 필요(로컬은 `.env`, 레일웨이는 대시보드에 별도 설정). 호출마다 비용 발생하므로 사용량 늘면 제한 로직 고려
- `python-dotenv`가 `requirements.txt`엔 있었지만 실제 `load_dotenv()` 호출이 빠져있던 걸 발견해 `app/main.py`, `alembic/env.py`에 추가함 (로컬 `.env` 파일이 이제 정상적으로 반영됨)
- devlee 프론트의 공개 주소는 `src/config.ts`의 `API_BASE_URL`에 하드코딩되어 있음. 레일웨이 도메인이 바뀌면 여기도 같이 갱신 필요

## 남은 기능 / 알려진 제약

계획했던 핵심 기능(사진기록/넛지/스트릭/성장캐릭터/미션/기기간동기화/소셜·랭킹/AI성분분석)은 전부 구현 및 검증 완료(샌드박스 앱 실기기 확인 포함). 남은 건:

- **디자인/UX 다듬기** — Claude Design 프로토타입(홈/식단기록/랭킹 3화면) 기반 리뉴얼 완료. 세 화면 다 타입체크/린트/빌드/브라우저 확인 마침
- **인앱광고/인앱결제/토스 로그인** — 사업자 등록증이 필요한데 사업자 등록 계획이 없어서 사실상 안 쓸 기능. Granite 시작 템플릿이 남긴 `InAppAdsPage.tsx`/`InAppPurchasePage.tsx`와 관련 훅(`useInAppAds.tsx`/`useInAppPurchase.ts`), 홈 화면 진입 버튼은 삭제함
- **수익화** — 위 항목들이 막혀 있어서 같이 보류 상태

## 컨벤션

- UI는 `@toss/tds-mobile`(TDS) 컴포넌트를 사용. 색상은 `@toss/tds-colors`의 `colors`/`adaptive` 사용
- 앱인토스 SDK(`@apps-in-toss/web-framework`) 기능은 페이지에서 직접 부르지 않고 `src/hooks`의 커스텀 훅으로 감싸서 사용
- 실제 배포 전 교체가 필요한 값은 `TODO` 주석으로 표시할 것

## 협업 규칙

- 앱 기능(페이지, 훅, 설정 등)을 수정했다면 관련 내용을 이 CLAUDE.md에도 함께 반영할 것. 코드만 바꾸고 문서를 그대로 두지 말 것
- 파일 수정은 한 줄씩 나눠서 여러 번 편집하지 말고, 변경 내용을 모아 한 번에 적용할 것
- 모든 답변과 코드 주석은 한글로 작성할 것. 라이브러리/프레임워크 이름, 코드 식별자, 공식 용어 등 영어로 써야만 의미가 통하는 경우에만 예외적으로 영어를 사용할 것
- 사용자가 입력한 프롬프트에 대해 바로 구현부터 하지 말 것. 먼저 어떻게 할지 설명하거나 확인받고 나서 진행할 것
- 수정을 거칠 때마다(기능/설정 변경을 마칠 때마다) git 커밋과 origin push까지 진행할 것
- 정식 출시 전까지는, 기능 구현이나 수정을 마칠 때마다 로컬 dev 서버를 켜서 바로 샌드박스 앱에서 확인할 수 있게 해줄 것 (IP가 설정값과 다르면 `granite.config.ts`도 같이 갱신)
