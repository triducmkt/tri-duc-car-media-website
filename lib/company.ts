/**
 * Legal identity of the company — single source for the contact page, footer,
 * VAT advantage block and Organization JSON-LD. Source: Giấy chứng nhận đăng ký
 * doanh nghiệp (Phòng ĐKKD – Sở Tài chính TP.HCM), copy in hq/backups.
 * Only company-level facts here: never the owner's personal ID, birth date or
 * home address, which are on the certificate but must not be published.
 */
export const COMPANY = {
  legalNameVi: "CÔNG TY TNHH TRÍ ĐỨC CAR MEDIA",
  legalNameEn: "TRI DUC CAR MEDIA COMPANY LIMITED",
  shortName: "TRI DUC CAR MEDIA CO.,LTD",
  brandName: "Trí Đức Car Media",
  type: "Công ty TNHH một thành viên",
  taxCode: "0319761584",
  registeredOn: "2026-10-22",
  amendedOn: "2026-10-30",
  issuer: "Phòng Đăng ký kinh doanh – Sở Tài chính TP.HCM",
  charterCapitalVnd: 1_000_000_000,
  representative: "Tăng Trí Đức",
  representativeTitle: "Giám đốc",
  address: {
    street: "50-50A Lê Thúc Hoạch",
    ward: "Phường Phú Thọ Hòa",
    city: "Thành phố Hồ Chí Minh",
    country: "VN",
  },
  phone: "0769918685",
  phoneDisplay: "076.991.8685",
  email: "tangtriduc@triduccar.media",
  siteUrl: "https://triduccar.media",
  fanpage: "https://www.facebook.com/triduccar.media",
  zalo: "https://zalo.me/0769918685",
  youtube: "https://www.youtube.com/@TangTriDuc1989",
  /** Public lookup of the tax code on the national tax portal. */
  taxLookupUrl: "https://tracuunnt.gdt.gov.vn/tcnnt/mstdn.jsp",
} as const;

export const companyAddressLine = `${COMPANY.address.street}, ${COMPANY.address.ward}, ${COMPANY.address.city}`;

/** dd/MM/yyyy from an ISO date, without timezone surprises. */
export function formatViDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** schema.org Organization for the site-wide JSON-LD. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${COMPANY.siteUrl}/#organization`,
    name: COMPANY.brandName,
    legalName: COMPANY.legalNameVi,
    alternateName: [COMPANY.legalNameEn, COMPANY.shortName],
    url: COMPANY.siteUrl,
    logo: `${COMPANY.siteUrl}/brand/logo.png`,
    image: `${COMPANY.siteUrl}/brand/logo.png`,
    taxID: COMPANY.taxCode,
    vatID: COMPANY.taxCode,
    foundingDate: COMPANY.registeredOn,
    telephone: `+84${COMPANY.phone.slice(1)}`,
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.ward,
      addressRegion: COMPANY.address.city,
      addressCountry: COMPANY.address.country,
    },
    founder: { "@type": "Person", name: COMPANY.representative, jobTitle: COMPANY.representativeTitle },
    areaServed: "VN",
    sameAs: [COMPANY.fanpage, COMPANY.youtube],
  };
}
