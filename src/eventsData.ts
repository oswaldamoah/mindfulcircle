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
};

export const eventsData: EventMeta[] = [
  {
    slug: "color-picnic",
    title: "The Color Picnic",
    summary:
      "A wellness experience of music, games, and good vibes.",
    location: "Aburi Botanical Gardens",
    time: "Shuttle leaves at 9AM. Event from 10AM-4PM",
    status: "Upcoming",
    date: { month: "Jun", day: "06", year: "2026" },
    highlight: "Wear your color with pride. Come as you are.",
    activities: [
      "Discounted price ends May 30th",
      "Group Games & Challenges",
      "Picnic & Music",
      "Bring items in your color or to support any color",
    ],
    partners: [],
    flyerImage: "/events/color-picnic-flyer.jpg",
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
