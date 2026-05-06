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
  flyerImage?: string;
};

export const eventsData: EventMeta[] = [
  {
    slug: "color-picnic",
    title: "The Color Picnic",
    summary:
      "Move. Connect. Belong. A vibrant wellness experience of movement, connection, games, music, and good vibes.",
    location: "Aburi Botanical Gardens",
    time: "6:00AM",
    status: "Upcoming",
    date: { month: "Jun", day: "06", year: "2026" },
    highlight: "Wear your color with pride. Come as you are.",
    activities: [
      "Wellness Walk (Peduase  Aburi)",
      "Group Games & Challenges",
      "Meaningful Conversations",
      "Picnic & Music",
      "Giveaways & Surprises",
    ],
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
  },
];
