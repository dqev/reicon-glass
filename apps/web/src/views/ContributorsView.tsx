import { useState, useEffect } from "react";
import { playClickSound } from "../utils/sound";

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  contributions?: number;
}

const CACHE_KEY = "reicon_github_community_cache_v2";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

interface CommunityCache {
  timestamp: number;
  totalStars: number;
  contributors: GitHubUser[];
  stargazers: GitHubUser[];
}

function getLocalCache(): CommunityCache | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CommunityCache = JSON.parse(raw);
    if (parsed && typeof parsed.timestamp === "number" && Array.isArray(parsed.contributors)) {
      return parsed;
    }
  } catch {
    // Ignore JSON or storage errors
  }
  return null;
}

function setLocalCache(data: Omit<CommunityCache, "timestamp">) {
  try {
    if (typeof localStorage === "undefined") return;
    const payload: CommunityCache = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

export interface ContributorsViewProps {
  color?: string;
  onColorChange?: (c: string) => void;
  onCopyNotice?: (msg: string) => void;
  onOpenCmdk?: () => void;
}

export function ContributorsView(_props?: ContributorsViewProps) {
  const initialCache = getLocalCache();
  const isCacheFresh = initialCache ? Date.now() - initialCache.timestamp < CACHE_TTL_MS : false;

  const [contributors, setContributors] = useState<GitHubUser[]>(initialCache?.contributors || []);
  const [stargazers, setStargazers] = useState<GitHubUser[]>(initialCache?.stargazers || []);
  const [totalStars, setTotalStars] = useState<number>(initialCache?.totalStars || 0);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCache || (!isCacheFresh && initialCache.contributors.length === 0));

  // Read environment variable VITE_GITHUB_TOKEN from codebase / env
  const envToken =
    import.meta.env.VITE_GITHUB_TOKEN ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("reicon_github_token") : "") ||
    "";

  useEffect(() => {
    let cancelled = false;

    // If cache is fresh (< 15 mins), bypass API fetch completely to save rate limits
    const cache = getLocalCache();
    if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS && cache.contributors.length > 0) {
      setIsLoading(false);
      return;
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (envToken.trim()) {
      headers.Authorization = `Bearer ${envToken.trim()}`;
    }

    if (!cache || cache.contributors.length === 0) {
      setIsLoading(true);
    }

    let fetchedRepoStars = initialCache?.totalStars || 0;
    let fetchedContributors = initialCache?.contributors || [];
    let fetchedStargazers = initialCache?.stargazers || [];

    const fetchRepo = fetch("https://api.github.com/repos/dqev/reicon", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((repo) => {
        if (!cancelled && repo && typeof repo.stargazers_count === "number") {
          fetchedRepoStars = repo.stargazers_count;
          setTotalStars(repo.stargazers_count);
        }
      })
      .catch(() => {});

    const fetchContributors = fetch("https://api.github.com/repos/dqev/reicon/contributors", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GitHubUser[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          fetchedContributors = data;
          setContributors(data);
        }
      })
      .catch(() => {});

    const fetchStargazers = Promise.all([
      fetch("https://api.github.com/repos/dqev/reicon/stargazers?per_page=100&page=1", { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch("https://api.github.com/repos/dqev/reicon/stargazers?per_page=100&page=2", { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p1, p2]) => {
        const combined = [...(Array.isArray(p1) ? p1 : []), ...(Array.isArray(p2) ? p2 : [])];
        if (!cancelled && combined.length > 0) {
          fetchedStargazers = combined;
          setStargazers(combined);
        }
      })
      .catch(() => {});

    Promise.allSettled([fetchRepo, fetchContributors, fetchStargazers]).then(() => {
      if (cancelled) return;
      setIsLoading(false);
      if (fetchedContributors.length > 0 || fetchedStargazers.length > 0) {
        setLocalCache({
          totalStars: fetchedRepoStars,
          contributors: fetchedContributors,
          stargazers: fetchedStargazers,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [envToken]);

  // Display up to 101 profile cards (positions 1 to 101)
  const displayedStargazers = stargazers.slice(0, 101);
  const effectiveTotalStars = Math.max(totalStars, stargazers.length);
  // Calculate remaining stargazers count for the last card position
  const restStarsCount = Math.max(effectiveTotalStars - displayedStargazers.length, 0);

  const handleOpenStargazersOnGithub = () => {
    playClickSound();
    window.open("https://github.com/dqev/reicon/stargazers", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO Banner Header */}
      <div className="flex flex-col items-center text-center gap-6 sm:gap-7 py-10 sm:py-16 select-none max-w-4xl mx-auto px-4">
        <h1 className="text-lg sm:text-2xl font-[550] leading-[1.4] tracking-[-0.3px] text-[var(--text-primary)] flex flex-col items-center gap-1.5 sm:gap-2 text-center">
          <span>Reicon Contributors &amp; Stargazers</span>
          <span className="text-[var(--text-secondary)]">Special thanks to developers, open-source contributors &amp; stargazers</span>
        </h1>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="w-full py-16 sm:py-24 px-4 flex flex-col items-center justify-center select-none max-w-full">
          <div className="word-loader max-w-full">
            <span className="text-[var(--text-secondary)] font-medium">Loading</span>
            <div className="words">
              <span className="word">stargazers</span>
              <span className="word">contributors</span>
              <span className="word">developers</span>
              <span className="word">profiles</span>
              <span className="word">stargazers</span>
            </div>
          </div>
        </div>
      ) : (
        /* Grids Container */
        <div className="w-full flex flex-col gap-10">
          {/* SECTION 1: CONTRIBUTORS */}
          {contributors.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-[600] text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <span>Code Contributors</span>
                  <span className="text-xs sm:text-sm font-mono text-[var(--text-muted)] font-normal">
                    ({contributors.length})
                  </span>
                </h2>
              </div>
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {contributors.map((user) => (
                  <UserCard
                    key={user.id || user.login}
                    user={user}
                    subtitle={user.contributions ? `${user.contributions} commits` : undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: STARGAZERS */}
          {displayedStargazers.length > 0 && (
            <section className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-[600] text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <span>Stargazers</span>
                  <span className="text-xs sm:text-sm font-mono text-[var(--text-muted)] font-normal">
                    ({effectiveTotalStars.toLocaleString()})
                  </span>
                </h2>
              </div>
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {displayedStargazers.map((user) => (
                  <UserCard
                    key={user.id || user.login}
                    user={user}
                  />
                ))}

                {restStarsCount > 0 && (
                  <div
                    onClick={handleOpenStargazersOnGithub}
                    title={`View all ${effectiveTotalStars.toLocaleString()} stargazers on GitHub`}
                    className="aspect-square relative flex flex-col items-center justify-center p-3.5 rounded-[18px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-dashed border-[var(--border-medium)] group cursor-pointer select-none transition-all"
                  >
                    <div className="flex flex-col items-center gap-0.5 mt-2 max-w-full text-center">
                      <span className="text-xs sm:text-sm font-[650] text-[var(--text-primary)] tracking-tight truncate max-w-full">
                        + {restStarsCount.toLocaleString()} more
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-full">
                        View on GitHub ↗
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function UserCard({
  user,
  subtitle,
}: {
  user: GitHubUser;
  subtitle?: string;
}) {
  const handleOpenGithub = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    window.open(user.html_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      title={`${user.name || user.login} (@${user.login})`}
      onClick={handleOpenGithub}
      className="aspect-square relative flex flex-col items-center justify-between p-3.5 rounded-[18px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] group cursor-pointer select-none"
    >
      {/* Centered Avatar Image */}
      <div className="my-auto py-1 flex flex-col items-center justify-center relative">
        <img
          src={user.avatar_url}
          alt={user.login}
          width={80}
          height={80}
          loading="lazy"
          className="size-16 sm:size-20 rounded-full object-cover border border-[var(--border-medium)] group-hover:scale-105 transition-transform duration-150 shadow-md shrink-0"
        />
        {subtitle && (
          <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-btn-hover)] text-[10px] sm:text-[11px] font-mono font-medium text-[var(--accent-color,#9B8AFB)] border-none shrink-0 whitespace-nowrap">
            {subtitle}
          </span>
        )}
      </div>

      {/* Bottom Name & Handle Readout */}
      <div className="flex flex-col items-center gap-0.5 max-w-full text-center">
        <span className="text-[11px] sm:text-xs font-[500] text-[var(--text-primary)] truncate max-w-full tracking-tight">
          {user.name || user.login}
        </span>
        <span className="text-[9.5px] sm:text-[10.5px] font-mono text-[var(--text-muted)] truncate max-w-full">
          @{user.login}
        </span>
      </div>

      {/* GitHub Profile Link Action Button */}
      <div className="hidden sm:flex absolute inset-x-2 top-2 items-center justify-end gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100 z-10">
        <button
          type="button"
          onClick={handleOpenGithub}
          title={`View ${user.login} on GitHub`}
          className="size-7 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] flex items-center justify-center hover:opacity-90 motion-safe:active:scale-[0.97] border-none cursor-pointer"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
