# DevLee

앱인토스(Apps in Toss) 미니앱. React 18 + TypeScript + Vite, `@apps-in-toss/web-framework`(Granite) 기반.

## 명령어

- `npm run dev` — 로컬 개발 서버 (`granite dev`)
- `npm run build` — 빌드 (`ait build`)
- `npm run deploy` — 앱인토스에 배포 (`ait deploy`)
- `npm run lint` / `npm run format` — eslint / prettier

### 실기기(샌드박스 앱) 테스트

카메라 등 네이티브 SDK는 브라우저 미리보기에서 동작하지 않아 실기기 확인이 필요함. `granite.config.ts`의 `web.host`를 로컬 네트워크 IP로, `web.commands.dev`를 `"vite dev --host"`로 설정해두면 `npm run dev` 실행 시 로컬 네트워크에 서버가 노출됨. 샌드박스 앱에서 `intoss://whatimeat` 스킴으로 접속. IP는 개발 기기마다 달라지므로 `ifconfig`/`ipconfig getifaddr en0`로 매번 확인 후 값을 맞출 것

## 구조

- `src/App.tsx` — 진입 컴포넌트. 라우터 없이 `useState`로 페이지 전환(`page` 상태값에 따라 조건부 렌더링)
- `src/pages/` — 화면 단위 컴포넌트. `onBack` prop으로 이전 화면 복귀 처리
- `src/hooks/` — 기능별 로직(광고, 인앱결제 등)을 커스텀 훅으로 분리. 앱인토스 SDK 호출은 훅 안에 캡슐화
- `granite.config.ts` — 앱 이름/브랜드 색상/권한 등 미니앱 설정. `brand.icon`은 로컬 dev 서버 주소(`http://<IP>:5173/파일명`) 기준이라 IP가 바뀌거나 실제 배포할 때 다시 갱신 필요. 다크모드 아이콘은 코드가 아니라 앱인토스 콘솔에서 별도 업로드
- `docs/skills/apps-in-toss.md`, `docs/skills/tds-mobile.md` — 앱인토스 API·TDS 컴포넌트 전체 레퍼런스. 분량이 커서 상시 로드하지 않음. 특정 API/컴포넌트 사용법이 필요할 때만 열어서 확인할 것

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
