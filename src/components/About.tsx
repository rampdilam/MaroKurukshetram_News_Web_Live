import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";

const About: React.FC = () => {
  const { t } = useTranslation();

  console.log("About component rendering");

  return (
    <>
      <Header />

      {/* About Section with Background Color */}
      <section className="relative py-12 px-4 font-mandali overflow-hidden" style={{ backgroundImage: "url('/lovable-uploads/About1.jpg')" }}>
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-blue-100 bg-opacity-90"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {t("about.title") || "About Us"}
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Enhanced Card containing Image + Text */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Column */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 lg:p-8 flex flex-col items-center justify-center">
                <div className="relative group">
                  <img
                    src="/lovable-uploads/IslamSir.png"
                    alt={t("about.imageAlt")}
                    className="rounded-full shadow-xl w-64 h-64 lg:w-72 lg:h-72 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300"></div>
                </div>
                <div className="text-center mt-6">
                  <h4 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                    {t("about.personName")}
                  </h4>
                  <p className="text-base text-blue-600 font-medium">
                    {t("about.personSubtitle")}
                  </p>
                </div>
              </div>

              {/* Text Column */}
              <div className="p-6 lg:p-8">
                <div className="space-y-6 text-gray-700 text-base leading-relaxed">
                  <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                    <p className="text-gray-800">
                      <span className="font-bold text-blue-600 text-lg">
                        {t("about.highlight1")}
                      </span>
                      {t("about.p1")}
                      <span className="font-bold text-blue-600">
                        {t("about.highlight2")}
                      </span>
                      {t("about.p1b")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-700">
                      {t("about.p2a")}{" "}
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {t("about.highlight3")}
                      </span>
                      {t("about.p2b")}
                    </p>

                    <p className="text-gray-700">
                      {t("about.p3a")}{" "}
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {t("about.highlight4")}
                      </span>{" "}
                      {t("about.p3b")}
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-700 mb-3">
                        <span className="font-bold text-blue-600">
                          {t("about.highlight5")}
                        </span>{" "}
                        {t("about.p4")}
                      </p>

                      <p className="text-gray-700">
                        <span className="font-bold text-blue-600">
                          {t("about.highlight6")}
                        </span>{" "}
                        {t("about.p5")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;