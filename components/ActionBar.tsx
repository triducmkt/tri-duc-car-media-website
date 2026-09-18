"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./ActionBar.module.css";

type Props = {
  phone?: string;
  zaloUrl?: string;
};

/** Fixed Call / Zalo / Book bar pinned to the bottom of the screen on
 *  mobile. Rendered once in the locale layout — no need to repeat per page. */
export function ActionBar({
  phone = "0769918685",
  zaloUrl = "https://zalo.me/0769918685",
}: Props) {
  const t = useTranslations("actionBar");

  return (
    <nav className={styles.bar} aria-label={t("ariaLabel")}>
      <a href={`tel:${phone}`}>{t("call")}</a>
      <a href={zaloUrl} target="_blank" rel="noopener noreferrer">{t("zalo")}</a>
      <Link href="/booking">{t("booking")}</Link>
    </nav>
  );
}
