import React from "react";
import { Helmet } from "react-helmet";

function About() {
  return (
    <>
      <Helmet>
        <title>About Page</title>
        <meta name="description" content="CPET | About Page" />
      </Helmet>
      <div className="isolate bg-gray-900">
        <main>
          <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
              {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full py-1 px-3 text-sm leading-6 text-white ring-1 ring-blue-900/10 hover:ring-blue-900/20">
                About Us
              </div>
            </div> */}
              <div className="text-center">
                <h1 className="text-xl font-bold  text-[#2ab38e] sm:text-6xl">
                  Centre for Public Education and Training (CPET)
                </h1>
                <p className="mt-6 text-lg leading-8 text-white">
                  Centre for Public Education and Training is an extension of
                  Darul Huda Islamic University devised for providing
                  socio-educational empowerment programs for the public. CPET
                  plans, designs and implements awareness programs aimed at
                  different age groups of the public.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6 mb-2">
                  <a
                    href="/images/CPET BYLAW 2024-25.pdf"
                    download
                    target={"_blank"}
                    className="rounded-md bg-[#094b5e] px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Download Our Brochure
                  </a>
                </div>
                <div className="flex items-center justify-center gap-x-6 mb-7">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfb_S31WKWCzDglCQokIOkyfrUSWSmqCjlaPuyMxfE8g_CXOg/viewform"
                    target={"_blank"}
                    className="rounded-md bg-[#2a95b3] px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Register Now
                  </a>
                </div>
              </div>
            </div>
          </div>
          <iframe
            src="/images/CPET BYLAW 2024-25.pdf"
            width="100%"
            height="500px"
          ></iframe>
        </main>
      </div>
    </>
  );
}

export default About;
