import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://ansh-singh.vercel.app/", // replace this with your deployed domain
  author: "Anshuman Singh",
  profile: "https://ansh-singh.vercel.app/",
  desc: "Anshuman Singh's personal website and blog",
  title: "Ansh",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
};

export const LOCALE = {
  lang: "en",
  langTag: ["en-EN"],
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/MrMoneyInTheBank",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/mr-money-in-the-bank/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
];
