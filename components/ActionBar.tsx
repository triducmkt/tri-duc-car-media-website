"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import styles from "./ActionBar.module.css";

type Props = {
  phone?: string;
  zaloUrl?: string;
};

/** Fixed Call / Zalo / Book bar pinned to the bottom of the screen on
 *  mobile. Rendered once in the locale layout — no need to repeat per page.
 *  F11 (phương án B): sans 15px / 700, no caps, each action with an icon;
 *  "Đặt lịch" uses the brand gradient button. */
export function ActionBar({
  phone = "0769918685",
  zaloUrl = "https://zalo.me/0769918685",
}: Props) {
  const t = useTranslations("actionBar");

  return (
    <nav className={styles.bar} aria-label={t("ariaLabel")}>
      <a href={`tel:${phone}`}>
        <Phone className={styles.icon} aria-hidden /> {t("call")}
      </a>
      <a href={zaloUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className={styles.icon} aria-hidden /> {t("zalo")}
      </a>
      <Link href="/booking" className={styles.book}>
        <CalendarDays className={styles.icon} aria-hidden /> {t("booking")}
      </Link>
    </nav>
  );
}
