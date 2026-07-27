import {
  pageCategoryMeta,
  type CategoryAccent,
} from "@/config/pageCategoryMeta";
import type { PageCategory } from "@/config/pageData";
import { stickerStyle, stickerStyleRaw } from "@/shared/styles/heal";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";

// Literal class strings keep Tailwind v4's static class discovery reliable.
const LABEL_FILL: Record<CategoryAccent, string> = {
  teal: "bg-app-teal-soft",
  blue: "bg-app-blue-soft",
  purple: "bg-app-purple-soft",
  green: "bg-app-green-soft",
  peach: "bg-app-peach-soft",
  pink: "bg-app-pink-soft",
};

const LABEL_ICON: Record<CategoryAccent, string> = {
  teal: "text-app-teal-ink",
  blue: "text-app-blue-ink",
  purple: "text-app-purple-ink",
  green: "text-app-green-ink",
  peach: "text-app-peach-ink",
  pink: "text-app-pink-ink",
};

interface CategoryLabelProps {
  category: PageCategory;
  className?: string;
}

/**
 * Live, accessible section label. Keeping the wording in HTML avoids baking
 * duplicate or malformed text into the generated cover artwork.
 */
export function CategoryLabel({
  category,
  className = "",
}: CategoryLabelProps) {
  const { Icon: CategoryIcon, accent, label } = pageCategoryMeta[category];

  return (
    <span
      className={`heal-cutout inline-flex items-center gap-1.5 px-3 py-1 font-hand text-sm leading-none text-sticker-ink ${LABEL_FILL[accent]} ${className}`}
      style={stickerStyle(1)}
    >
      <CategoryIcon
        size={15}
        weight="duotone"
        className={LABEL_ICON[accent]}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

interface CategoryCoverProps {
  category: PageCategory;
  imagePath: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  title: string;
  className?: string;
}

/**
 * Shared 2:1 category masthead. On small screens the real h1 drops below the
 * art so long page titles never collide with the illustration; from `sm`
 * upward it becomes the pasted lower-left label the artwork was composed for.
 */
export function CategoryCover({
  category,
  imagePath,
  imageAlt,
  imageWidth,
  imageHeight,
  title,
  className = "",
}: CategoryCoverProps) {
  return (
    <div className={`relative mb-5 ${className}`}>
      <div className="relative aspect-[2/1] overflow-hidden rounded-2xl ring-1 ring-sticker-ink/10">
        <img
          src={resolveAssetUrl(imagePath)}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <CategoryLabel
          category={category}
          className="absolute left-3 top-3 z-10 sm:left-5 sm:top-5"
        />
      </div>
      <h1
        className="heal-cutout relative z-10 mt-4 inline-block max-w-full text-balance bg-surface px-5 py-1.5 font-script text-[clamp(1.8rem,1.35rem+1.8vw,3rem)] leading-[0.98] text-ink sm:absolute sm:bottom-5 sm:left-5 sm:mt-0 sm:max-w-[50%]"
        style={stickerStyleRaw(
          "-1deg",
          "14px 9px 16px 8px / 8px 16px 9px 14px",
        )}
      >
        {title}
      </h1>
    </div>
  );
}
