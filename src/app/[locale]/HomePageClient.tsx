"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Coins,
  Copy,
  Crown,
  Egg,
  GraduationCap,
  Sparkles,
  Ticket,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
// import { SidebarAd } from "@/components/ads/SidebarAd";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mydinoparkwiki.wiki";
  // 内部链接已按需求移除，prop 保留以维持签名兼容
  void moduleLinkMap;

  // M1 代码复制反馈
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(
        () => setCopiedCode((cur) => (cur === code ? null : cur)),
        1500,
      );
    } catch {
      /* clipboard 不可用时静默 */
    }
  };

  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "My Dino Park Wiki",
        description:
          "Complete My Dino Park Wiki covering codes, dinosaur tier lists, egg guides, income tips, park upgrades, and beginner guides for the Roblox tycoon.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "My Dino Park - Roblox Dino Park Tycoon",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "My Dino Park Wiki",
        alternateName: "My Dino Park",
        url: siteUrl,
        description:
          "Complete My Dino Park Wiki resource hub for codes, dinosaur tier lists, egg guides, income tips, and park upgrades for the Roblox tycoon",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "My Dino Park Wiki - Roblox Dino Park Tycoon",
        },
        sameAs: [
          "https://www.roblox.com/games/80701570784699/My-Dino-Park",
          "https://www.roblox.com/communities/532484073/Dino-Community",
          "https://discord.com/invite/eQHNk8dGpz",
          "https://www.youtube.com/watch?v=ewX7kzNTmNk",
        ],
      },
      {
        "@type": "VideoGame",
        name: "My Dino Park",
        gamePlatform: ["Roblox"],
        applicationCategory: "Game",
        genre: ["Tycoon", "Simulation", "Management"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 6,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: "0",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/80701570784699/My-Dino-Park",
        },
      },
      {
        "@type": "VideoObject",
        name: "HOW TO PLAY & NEW CODES! Update 1 | My Dino Park! Roblox",
        description:
          "My Dino Park gameplay and codes guide showing how to play, hatch dinosaurs, and redeem the latest codes for the Roblox tycoon.",
        uploadDate: "2026-07-03",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/ewX7kzNTmNk",
        url: "https://www.youtube.com/watch?v=ewX7kzNTmNk",
      },
    ],
  };

  const codes = t.modules.myDinoParkCodes;
  const beginner = t.modules.myDinoParkBeginnerGuide;
  const tierList = t.modules.myDinoParkTierList;
  const eggsGuide = t.modules.myDinoParkEggsGuide;

  // 层级徽章配色：S 实心主题色 → A 主题色半透 → B/C/D 灰阶
  const tierBadgeStyles: Record<string, string> = {
    S: "bg-[hsl(var(--nav-theme))] text-white",
    A: "bg-[hsl(var(--nav-theme)/0.22)] text-[hsl(var(--nav-theme-light))]",
    B: "bg-white/10 text-foreground",
    C: "bg-white/5 text-muted-foreground",
    D: "bg-white/5 text-muted-foreground border border-border",
  };

  // 工具卡与模块锚点 1:1 映射
  const toolSectionIds = [
    "my-dino-park-codes",
    "my-dino-park-beginner-guide",
    "my-dino-park-tier-list",
    "my-dino-park-eggs-guide",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 左侧广告容器 - Fixed 定位 */}
      {/* <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ left: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x300"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300}
        />
      </aside> */}

      {/* 右侧广告容器 - Fixed 定位 */}
      {/* <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ right: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x600"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600}
        />
      </aside> */}

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("my-dino-park-codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/80701570784699/My-Dino-Park"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="ewX7kzNTmNk"
              title="HOW TO PLAY & NEW CODES! Update 1 | My Dino Park! Roblox"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 4 Navigation Cards (1:1 锚点映射) */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* M1: My Dino Park Codes */}
      <section id="my-dino-park-codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 md:mb-12 scroll-reveal">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.1)]">
              <Ticket className="h-6 w-6 text-[hsl(var(--nav-theme-light))]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{codes.title}</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-3">
              {codes.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl">
              {codes.intro}
            </p>
          </div>

          {/* 兑换步骤提示 */}
          <div className="mb-8 rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-4 md:p-6">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <ClipboardCheck className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span>How to redeem</span>
              {codes.lastChecked && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Checked {codes.lastChecked}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              {codes.redemptionHint}
            </p>
          </div>

          {/* 活跃代码卡片 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {codes.activeCodes?.map((c: any) => {
              const copied = copiedCode === c.code;
              return (
                <div
                  key={c.code}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <code className="rounded-md bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 font-mono text-base md:text-lg font-bold tracking-wide text-[hsl(var(--nav-theme-light))]">
                      {c.code}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(c.code)}
                      aria-label={`Copy code ${c.code}`}
                      className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Coins className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <span className="font-medium text-foreground">{c.reward}</span>
                  </div>
                  {c.priority && (
                    <p className="text-xs text-muted-foreground">{c.priority}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 过期代码 */}
          {codes.expiredCodes?.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Expired Codes
              </h3>
              <div className="flex flex-wrap gap-2">
                {codes.expiredCodes.map((c: any) => (
                  <span
                    key={c.code}
                    className="rounded-md border border-border bg-white/5 px-2.5 py-1 font-mono text-xs text-muted-foreground line-through"
                  >
                    {c.code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 模块间广告 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* M2: My Dino Park Beginner Guide */}
      <section
        id="my-dino-park-beginner-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 md:mb-12 scroll-reveal">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.1)]">
              <GraduationCap className="h-6 w-6 text-[hsl(var(--nav-theme-light))]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {beginner.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-3">
              {beginner.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl">
              {beginner.intro}
            </p>
          </div>

          <ol className="relative space-y-6 md:space-y-8 border-l border-[hsl(var(--nav-theme)/0.25)] pl-6 md:pl-10">
            {beginner.steps?.map((s: any, index: number) => (
              <li key={index} className="relative scroll-reveal">
                <span className="absolute -left-[31px] md:-left-[47px] top-0 flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] text-xs md:text-sm font-bold text-white ring-4 ring-background">
                  {index + 1}
                </span>
                <div className="rounded-xl border border-border bg-card p-4 md:p-6">
                  <h3 className="mb-2 text-base md:text-lg font-semibold">
                    {s.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {s.description}
                  </p>
                  {s.result && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-[hsl(var(--nav-theme)/0.06)] p-3 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <span>{s.result}</span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 模块间广告 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* M3: My Dino Park Tier List */}
      <section id="my-dino-park-tier-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 md:mb-12 scroll-reveal">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.1)]">
              <Crown className="h-6 w-6 text-[hsl(var(--nav-theme-light))]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {tierList.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-3">
              {tierList.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl">
              {tierList.intro}
            </p>
          </div>

          <div className="space-y-6">
            {tierList.tiers?.map((tier: any) => (
              <div
                key={tier.tier}
                className="rounded-xl border border-border bg-card p-4 md:p-6 scroll-reveal"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold ${tierBadgeStyles[tier.tier] || tierBadgeStyles.D}`}
                  >
                    {tier.tier}
                  </span>
                  <h3 className="text-base md:text-lg font-semibold">
                    {tier.label}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  {tier.entries?.map((e: any, i: number) => (
                    <div
                      key={`${e.name}-${i}`}
                      className="rounded-lg border border-border bg-white/[0.02] p-3 md:p-4"
                    >
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="font-semibold text-foreground">
                          {e.name}
                        </span>
                        {e.rarity && (
                          <span className="text-xs text-muted-foreground">
                            {e.rarity}
                          </span>
                        )}
                      </div>
                      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {e.type && <span>Type: {e.type}</span>}
                        {e.cost && <span>Cost: {e.cost}</span>}
                        {e.sourceEgg && <span>From: {e.sourceEgg}</span>}
                      </div>
                      {e.income && (
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--nav-theme-light))]">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {e.income}
                        </p>
                      )}
                      {e.reason && (
                        <p className="text-xs text-muted-foreground/90">
                          {e.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 移动端方形广告 */}
      {mobileBannerAd && (
        <div className="px-4 py-4 md:hidden">
          <AdBanner
            type={mobileBannerAd.type}
            adKey={mobileBannerAd.adKey}
            className="mx-auto"
          />
        </div>
      )}

      {/* M4: My Dino Park Eggs Guide */}
      <section
        id="my-dino-park-eggs-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 md:mb-12 scroll-reveal">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.1)]">
              <Egg className="h-6 w-6 text-[hsl(var(--nav-theme-light))]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {eggsGuide.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-3">
              {eggsGuide.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl">
              {eggsGuide.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {eggsGuide.eggs?.map((egg: any, index: number) => (
              <div
                key={egg.egg}
                className="flex flex-col rounded-xl border border-border bg-card p-4 md:p-5 scroll-reveal"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                      <Egg className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                    </span>
                    <h3 className="text-base md:text-lg font-semibold">
                      {egg.egg}
                    </h3>
                  </div>
                  <span className="rounded-md bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs font-medium text-[hsl(var(--nav-theme-light))]">
                    {egg.rarityPool}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-medium text-foreground">{egg.cost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hatch Time</p>
                    <p className="font-medium text-foreground">{egg.hatchTime}</p>
                  </div>
                </div>

                {egg.income && (
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--nav-theme-light))]">
                    <TrendingUp className="h-4 w-4" />
                    {egg.income}
                    <span className="text-xs font-normal text-muted-foreground">
                      avg income
                    </span>
                  </p>
                )}

                {egg.hatchResults?.length > 0 && (
                  <p className="mb-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      Hatches:
                    </span>{" "}
                    {egg.hatchResults.join(" · ")}
                  </p>
                )}

                <div className="mt-auto space-y-2 border-t border-border pt-3 text-xs">
                  {egg.bestUse && (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        Best use:
                      </span>{" "}
                      {egg.bestUse}
                    </p>
                  )}
                  {egg.buyTiming && (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        When to buy:
                      </span>{" "}
                      {egg.buyTiming}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 模块后广告 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.com/invite/eQHNk8dGpz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/532484073/Dino-Community"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/80701570784699/My-Dino-Park"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=ewX7kzNTmNk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
