export type EventDate = {
  month: string;
  day: string;
  year: string;
};

export type EventMeta = {
  slug: string;
  title: string;
  summary: string;
  location: string;
  time: string;
  status: "Upcoming" | "Past";
  date: EventDate;
  highlight: string;
  activities: string[];
  partners: { name: string; logo: string; url?: string }[];
  flyerImage?: string;
  shortcode?: string;
};

export const eventsData: EventMeta[] = [
  {
    slug: "color-picnic",
    title: "The Color Picnic",
    summary:
      "A wellness experience of music, games, and good vibes.",
    location: "Aburi Botanical Gardens",
    time: "All-day",
    status: "Past",
    date: { month: "Jun", day: "06", year: "2026" },
    highlight: "Wear your color with pride. Come as you are.",
    activities: [],
    partners: [
  {
    name: "Talk To Heal Foundation",
    logo: "https://res.cloudinary.com/sjlbtzir/image/upload/v1783200145/talktoheal_sy0mna.jpg",
    url: "https://www.instagram.com/_talktoheal/",
  },
  {
    name: "McLoi Impact Foundation",
    logo: "https://res.cloudinary.com/sjlbtzir/image/upload/v1783200145/mcloi_dfm3mb.jpg",
    url: "https://www.instagram.com/themcloiimpact_foundation/",
  },
  {
    name: "DKB Travel & Tours",
    logo: "https://res.cloudinary.com/sjlbtzir/image/upload/v1783200145/dkb_criapt.jpg",
    url: "https://www.instagram.com/dkbtravelandtours/",
  },
  {
    name: "VoyaEx Tours",
    logo: "https://res.cloudinary.com/sjlbtzir/image/upload/v1783200145/voyagex_nz2di8.jpg",
    url: "https://www.instagram.com/voyagextours/",
  },
],
  },
  {
    slug: "open-mic-night",
    title: "Open Mic Night",
    summary: "A night of stories, music, and courage from our community.",
    location: "Accra, Ghana",
    time: "Evening showcase",
    status: "Past",
    date: { month: "May", day: "18", year: "2026" },
    highlight: "Spotlighted voices, acoustic sets, and community storytelling.",
    activities: [],
    partners: [
      {
        name: "Hopeful Nkomo",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOptzBTKMgYDPjD-z24mGbRJUxKUHpm_ix6w&s",
        url: "https://www.instagram.com/hopefulnkomo/",
      },
    ],
  },
];
