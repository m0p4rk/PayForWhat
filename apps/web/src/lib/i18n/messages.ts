/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ToolManifest } from "../tools/catalog";
import { DEFAULT_LOCALE, type Locale } from "./locales";

interface Messages {
  readonly common: {
    readonly contribute: string;
    readonly sourceOnGitHub: string;
    readonly switchLanguage: string;
  };
  readonly home: {
    readonly footerOpen: string;
    readonly footerPrivate: string;
    readonly footerNoSubscription: string;
    readonly headline: string;
    readonly openTool: string;
  };
  readonly tool: {
    readonly staysOnDevice: string;
  };
  readonly contribute: {
    readonly title: string;
    readonly intro: string;
    readonly whatYouGet: string;
    readonly offers: readonly { readonly body: string; readonly title: string }[];
    readonly howItGoes: string;
    readonly steps: readonly { readonly body: string; readonly title: string }[];
    readonly guideLead: string;
    readonly guideTail: string;
    readonly smallerWaysIn: string;
    readonly smallerWaysInBody: string;
    readonly whatGetsDeclined: string;
    readonly whatGetsDeclinedBody: string;
    readonly openRepository: string;
    readonly questionsWelcome: string;
  };
}

const en: Messages = {
  common: {
    contribute: "Contribute",
    sourceOnGitHub: "PayForWhat source code on GitHub",
    switchLanguage: "Switch language",
  },
  home: {
    footerOpen: "Open source.",
    footerPrivate: "Your data stays yours.",
    footerNoSubscription: "No subscriptions.",
    headline: "A five-minute task should not become a subscription.",
    openTool: "Resize an image",
  },
  tool: {
    staysOnDevice: "Stays on your device",
  },
  contribute: {
    title: "Build a tool. Keep your name on it.",
    intro:
      "A first working version of a small tool comes together quickly now. The distance from “it runs” to something worth handing a stranger — edge cases, tests, accessibility, verification — is the actual work, and it is where most solo attempts quietly die. Work here has been deleted rather than shipped for exactly that reason. So the catalog is open: you walk that distance with review, hosting, and users already in place.",
    whatYouGet: "What you get",
    offers: [
      {
        body: "A tool that runs in the browser adds a page, not a server bill, so there is nothing to pass on. Tools that need server compute are a separate conversation about who pays, held in the issue before any work starts.",
        title: "Hosting costs you nothing",
      },
      {
        body: "The catalog records an owner for every tool. That credit belongs to whoever built it, and the tool page links back to you.",
        title: "Your name stays on it",
      },
      {
        body: "Proposal, review, and the pull request are done with you rather than left to you. For some people that is a portfolio piece with a live URL; for others it is review experience that is hard to get alone.",
        title: "You do not walk it alone",
      },
    ],
    howItGoes: "How it goes",
    steps: [
      {
        body: "Open a proposal issue describing the task, the free result, where the work happens, the worst thing someone might paste in, and how we know the output is correct. Agreement on the problem comes before code.",
        title: "Agree on the problem",
      },
      {
        body: "Declare the tool in the catalog manifest: what it does, whether it runs locally, how sensitive the data is. The schema refuses a local tool that also asks for network access, so the promise is enforced rather than assumed.",
        title: "Declare it",
      },
      {
        body: "Write the work as plain functions with tests beside them, then build the interface on top. Heavy work belongs in a worker so the page never freezes.",
        title: "Build and test it",
      },
      {
        body: "Run the verification suite, sign off your commits, and open the pull request from a branch on your fork. Main is the deployed branch and only takes reviewed changes.",
        title: "Open the pull request",
      },
    ],
    guideLead: "The full walkthrough, with the commands, lives in",
    guideTail:
      ". It is about a fifteen-minute read. Getting a tool through its quality gates afterwards is the long part — days to weeks, not minutes.",
    smallerWaysIn: "Smaller ways in",
    smallerWaysInBody:
      "Adding a whole tool is not the only useful contribution. These are scoped to finish in one sitting.",
    whatGetsDeclined: "What gets declined",
    whatGetsDeclinedBody:
      "Being technically correct is not sufficient. A tool is declined when it needs a subscription, an account, or a watermark to make sense; when it sends data to a server for work the browser can do; when the result cannot be verified; or when it carries a maintenance cost the project cannot sustain. These are product decisions, and they are explained in the issue rather than left unsaid.",
    openRepository: "Open the repository",
    questionsWelcome: "Questions are welcome as an issue before any code exists.",
  },
};

const ko: Messages = {
  common: {
    contribute: "함께 만들기",
    sourceOnGitHub: "GitHub에서 PayForWhat 소스 보기",
    switchLanguage: "언어 변경",
  },
  home: {
    footerOpen: "오픈소스입니다.",
    footerPrivate: "데이터는 그대로 내 것입니다.",
    footerNoSubscription: "구독 없습니다.",
    headline: "5분이면 끝나는 일이 구독이 되어서는 안 됩니다.",
    openTool: "이미지 크기 바꾸기",
  },
  tool: {
    staysOnDevice: "기기 안에서 처리됩니다",
  },
  contribute: {
    title: "도구를 만들고, 이름을 남기세요.",
    intro:
      "작은 도구의 첫 동작 버전은 이제 금방 나옵니다. 진짜 일은 “돌아간다”에서 “남에게 내놔도 되겠다”까지의 거리입니다. 엣지 케이스, 테스트, 접근성, 검증 — 대부분의 1인 프로젝트가 조용히 죽는 지점이 여기입니다. 이 프로젝트에서도 그 이유로 출시 대신 삭제된 작업이 있습니다. 그래서 도구 목록을 열어둡니다. 그 거리를 리뷰와 호스팅, 그리고 이미 있는 사용자와 함께 걸으시면 됩니다.",
    whatYouGet: "무엇을 얻게 되는가",
    offers: [
      {
        body: "브라우저에서 도는 도구는 페이지 하나가 늘어날 뿐 서버 비용이 생기지 않아서, 넘길 비용 자체가 없습니다. 서버 연산이 필요한 도구는 누가 비용을 부담할지 별도로 이야기하며, 작업을 시작하기 전에 이슈에서 정합니다.",
        title: "호스팅 비용은 받지 않습니다",
      },
      {
        body: "카탈로그는 모든 도구에 만든 사람을 기록합니다. 그 크레딧은 만든 사람의 것이고, 도구 페이지에서 본인 링크로 연결됩니다.",
        title: "이름이 그대로 남습니다",
      },
      {
        body: "제안과 리뷰, 풀 리퀘스트를 맡겨두지 않고 함께 진행합니다. 누군가에게는 실제 주소가 있는 포트폴리오가 되고, 누군가에게는 혼자서는 얻기 어려운 리뷰 경험이 됩니다.",
        title: "혼자 걷지 않습니다",
      },
    ],
    howItGoes: "어떻게 진행되는가",
    steps: [
      {
        body: "어떤 작업인지, 무료로 제공되는 결과가 무엇인지, 처리는 어디서 일어나는지, 최악의 입력은 무엇인지, 결과가 옳다는 걸 어떻게 확인하는지를 담아 제안 이슈를 엽니다. 코드보다 문제 합의가 먼저입니다.",
        title: "문제에 합의합니다",
      },
      {
        body: "카탈로그 매니페스토에 도구를 선언합니다. 무엇을 하는지, 로컬에서 도는지, 데이터가 얼마나 민감한지를 적습니다. 스키마가 로컬 도구의 네트워크 접근을 거부하기 때문에, 약속은 가정이 아니라 강제됩니다.",
        title: "선언합니다",
      },
      {
        body: "핵심 동작을 순수 함수로 쓰고 테스트를 나란히 둔 다음, 그 위에 화면을 만듭니다. 무거운 작업은 워커로 보내 화면이 멈추지 않게 합니다.",
        title: "만들고 테스트합니다",
      },
      {
        body: "검증 스위트를 돌리고 커밋에 서명한 뒤, 포크한 저장소의 브랜치에서 풀 리퀘스트를 엽니다. main은 배포 브랜치라 리뷰를 거친 변경만 받습니다.",
        title: "풀 리퀘스트를 엽니다",
      },
    ],
    guideLead: "명령어까지 포함한 전체 과정은",
    guideTail:
      "에 있습니다. 읽는 데는 15분쯤 걸립니다. 그 뒤에 품질 기준을 통과시키는 것이 긴 부분이고, 분이 아니라 며칠에서 몇 주가 걸립니다.",
    smallerWaysIn: "더 작게 시작하는 방법",
    smallerWaysInBody:
      "도구를 통째로 만드는 것만 기여는 아닙니다. 아래는 한 번 앉은 자리에서 끝낼 수 있는 크기입니다.",
    whatGetsDeclined: "어떤 경우에 거절되는가",
    whatGetsDeclinedBody:
      "기술적으로 맞다는 것만으로는 충분하지 않습니다. 구독이나 계정, 워터마크가 있어야 말이 되는 도구, 브라우저가 할 수 있는 일을 서버로 보내는 도구, 결과가 옳은지 확인할 수 없는 도구, 프로젝트가 감당할 수 없는 유지보수 비용을 남기는 도구는 거절됩니다. 이것은 제품 결정이고, 말하지 않고 넘어가는 대신 이슈에서 이유를 설명합니다.",
    openRepository: "저장소 열기",
    questionsWelcome: "코드가 없어도 질문은 이슈로 환영합니다.",
  },
};

const MESSAGES: Readonly<Record<Locale, Messages>> = { en, ko };

/**
 * Display copy for a tool, per locale.
 *
 * The manifest stays the single source of truth for the tool contract and
 * carries the English name and summary. A tool without a translation simply
 * shows its manifest copy, so adding a tool never requires touching this file.
 */
const TOOL_COPY: Readonly<
  Record<string, Partial<Record<Locale, { name: string; summary: string }>>>
> = {
  "image-resizer": {
    ko: {
      name: "이미지 리사이저",
      summary: "업로드 제한에 맞게 이미지 크기와 용량을 줄이거나 형식을 바꿉니다.",
    },
  },
};

export function getToolCopy(
  locale: Locale,
  tool: Pick<ToolManifest, "id" | "name" | "summary">,
): { name: string; summary: string } {
  if (locale === DEFAULT_LOCALE) {
    return { name: tool.name, summary: tool.summary };
  }

  return TOOL_COPY[tool.id]?.[locale] ?? { name: tool.name, summary: tool.summary };
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export type { Messages };
