import openMicHtml from "../open-mic-night.html?raw";

export default function EventsPage() {
  return (
    <main className="events-page">
      <section className="events-intro">
        <div className="events-intro-inner">
          <p className="events-kicker">Events</p>
          <h1 className="events-title">Moments we create together.</h1>
          <p className="events-body">
            Our events are safe, creative spaces where young people share their stories and find community. Explore past gatherings and the energy that makes them special.
          </p>
          <div className="events-card">
            <div>
              <p className="events-card-title">Open Mic Night</p>
              <p className="events-card-body">A night of stories, music, and courage from our community.</p>
            </div>
            <!--- donate --->
            <a className="btn-donate" href="#open-mic-night">View gallery</a>
          </div>
        </div>
      </section>
      <div className="events-frame-wrap">
        <iframe
          id="open-mic-night"
          className="events-frame"
          title="Open Mic Night"
          srcDoc={openMicHtml}
        />
      </div>
    </main>
  );
}
