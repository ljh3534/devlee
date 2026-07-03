import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "whatimeat",
  brand: {
    displayName: "오늘뭐먹", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#FD9B3C", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "http://172.28.76.25:5173/whatimeat-logo.png", // 로컬 dev 서버 기준 주소. IP가 바뀌거나 배포 시 다시 갱신 필요
  },
  web: {
    host: "172.28.76.25",
    port: 5173,
    commands: {
      dev: "vite dev --host",
      build: "vite build",
    },
  },
  permissions: [
    { name: "camera", access: "access" },
    { name: "photos", access: "read" },
  ],
  outdir: "dist",
});
