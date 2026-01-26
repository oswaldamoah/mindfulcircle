export default function App() {
  const copyToClipboard = (text: string) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        // Silently ignore clipboard errors
      });
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 md:px-8 lg:px-12 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Logo and Header */}
        <header className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center scale-[1.18]">
                <img
                  src="\public\ms.png" 
                  alt="Mindful Circle logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold leading-tight text-[#5b2a7f]">
                  Mindful
                </h1>
                <h1 className="text-4xl font-bold leading-tight text-[#5b2a7f]">
                  Circle
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 text-center">
              Help Us Create Safe Spaces for Mental Health
            </h2>
            <p className="mb-4 italic leading-relaxed text-gray-700">
              Mindful Circle is a youth-led mental health initiative creating
              safe spaces for conversation, healing, and community support. Your
              donation helps us reach more young people and reduce the stigma
              around mental health.
            </p>
            <p className="mb-2 italic leading-relaxed text-gray-700">
              Donations are used for:
            </p>
            <p className="mb-4 italic leading-relaxed text-gray-700">
              Logistics and campaign promotions that support mental health
              awareness and community outreach.
            </p>
            <p className="mb-6 italic leading-relaxed text-gray-700">
              NOTE: All donations go directly into supporting Mindful Circle
              activities and programs. We are committed to transparency and
              accountability in how funds are used. Updates shared via our social
              media platforms.
            </p>
            <div className="leading-relaxed space-y-1">
              <p>
                <a
                  href="https://instagram.com/the_mindfulcircle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-[#5b2a7f] transition-colors"
                >
                  IG: the_mindfulcircle
                </a>
              </p>
              <p>
                <a
                  href="mailto:miindfulcircle@gmail.com"
                  className="text-black hover:text-[#5b2a7f] transition-colors"
                >
                  Email: miindfulcircle@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="https://www.tiktok.com/@the_mindfulcircle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-[#5b2a7f] transition-colors"
                >
                  TikTok: the_mindfulcircle
                </a>
              </p>
            </div>
          </section>

          {/* Bank Account Details & Mobile Money Numbers */}
          <section className="mb-8">
            <div className="grid gap-10 md:grid-cols-2">
              {/* Bank Account Details */}
              <div>
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                  Bank Account Details
                </h2>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#c8a9d9] px-6 py-4 shadow-md">
                    <p className="text-lg text-gray-900">
                      Account number:{' '}
                      <button
                        type="button"
                        onClick={() => copyToClipboard('0000000000')}
                        className="text-black hover:text-[#5b2a7f] underline-offset-2 hover:underline cursor-pointer font-medium"
                      >
                        0000000000
                      </button>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#c8a9d9] px-6 py-4 shadow-md">
                    <p className="text-lg text-gray-900">Account name:</p>
                  </div>
                  <div className="rounded-2xl bg-[#c8a9d9] px-6 py-4 shadow-md">
                    <p className="text-lg text-gray-900">Bank: Absa bank</p>
                  </div>
                </div>
              </div>

              {/* Mobile Money Numbers */}
              <div>
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                  Mobile money numbers
                </h2>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#c8a9d9] px-6 py-4 shadow-md">
                    <p className="text-lg text-gray-900">
                      <button
                        type="button"
                        onClick={() => copyToClipboard('0599078844')}
                        className="text-black hover:text-[#5b2a7f] underline-offset-2 hover:underline cursor-pointer font-medium"
                      >
                        0599078844
                      </button>{' '}
                      MTN- Eugene Kwesi Arkhurst
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#c8a9d9] px-6 py-4 shadow-md">
                    <p className="text-lg text-gray-900">
                      <button
                        type="button"
                        onClick={() => copyToClipboard('0206238800')}
                        className="text-black hover:text-[#5b2a7f] underline-offset-2 hover:underline cursor-pointer font-medium"
                      >
                        0206238800
                      </button>{' '}
                      Telecel/Vodafone- Eugene Kwesi Arkhurst
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
