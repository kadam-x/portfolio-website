export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
  emote: string;
}

export const projects: Project[] = [
  {
    id: "rbl",
    title: "RBL Capital",
    status: "open source",
    description:
      "A simulated proprietary trading research system built to explore systematic edge across asset classes. Spans prediction markets, macro signals, equities, and mid-freq crypto desks.",
    tech: ["Python", "Polymarket", "Agent Frameworks", "Crypto Perps"],
    links: [
      {
        label: "Prediction Markets",
        url: "https://github.com/kadam-x/prediction-market-algo",
      },
      {
        label: "Tauric Research Fork",
        url: "https://github.com/kadam-x/TradingAgents",
      },
    ],
    emote:
      "I built this because prediction markets and DeFi are one of the few places where insider positioning is both legal and detectable.",
  },
  {
    id: "iv",
    title: "IV Surface Pipeline",
    status: "open source",
    description:
      "A full data engineering pipeline that ingests SPY options chain data daily, inverts Black-Scholes to compute implied volatility across all strikes and expiries, served via REST API and Grafana.",
    tech: ["Python", "Black-Scholes", "Data Warehouse", "REST API", "Grafana"],
    links: [
      {
        label: "Source",
        url: "https://github.com/kadam-x/volatility-surface-pipeline",
      },
      {
        label: "Docs",
        url: "https://github.com/kadam-x/volatility-surface-pipeline/blob/main/docs/architecture.md",
      },
    ],
    emote:
      "I wanted to build something that sits closer to how risk systems actually work than a typical portfolio project. Getting Brent's method to behave at the wings was the part that kept me up.",
  },
  {
    id: "catchwind",
    title: "Catch Wind",
    status: "closed source",
    description:
      "A dual-screen arcade shooter where you control two ships simultaneously. Each ship mirrors the other's movement but fires in opposite directions. Survive waves and unlock weapons.",
    tech: ["JavaScript", "Canvas", "Game Dev"],
    links: [],
    emote:
      "Two ships. One keyboard. Zero mercy. The core mechanic of mirrored movement but opposite firing directions creates this puzzle-like flow where you have to think about both sides simultaneously.",
  },
  {
    id: "nvim",
    title: "nvim-plugins",
    status: "open source",
    description:
      "A collection of personal Neovim plugins. Includes onyx-colorscheme, a dark, low-contrast colorscheme built for long sessions, and bufline.nvim, a minimal bufferline with diagnostics.",
    tech: ["Lua", "Neovim", "VimScript"],
    links: [
      {
        label: "onyx-colorscheme",
        url: "https://github.com/kadam-x/onyx-colorscheme/tree/main",
      },
      { label: "bufline.nvim", url: "https://github.com/kadam-x/bufline.nvim" },
    ],
    emote:
      "Every colorscheme I tried either burned my eyes or put me to sleep. So I made my own. Onyx is what happens when you spend too much time staring at a screen.",
  },
  {
    id: "portfolio",
    title: "Portfolio Website",
    status: "open source",
    description:
      "This very site, a personal portfolio built with Astro. Features a clean, academic-inspired UI, an animated robot mascot with dialogue system, and minimal project entries.",
    tech: ["Astro", "TypeScript"],
    links: [
      { label: "Source", url: "https://github.com/kadam-x/portfolio-website" },
    ],
    emote:
      "Built the whole thing in Astro. Wanted a clean, academic vibe that still felt polished. The robot was supposed to be a small easter egg but now she's basically the front desk.",
  },
];
