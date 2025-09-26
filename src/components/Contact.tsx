import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Contact: React.FC = () => {
  const { t } = useTranslation();

  console.log("Contact component rendering");

  return (
    <>
      <Header />

      {/* Contact Section with Background Image */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20 px-4 font-mandali"
        style={{ backgroundImage: "url('/lovable-uploads/contact.jpg')" }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Content */}
        <div className="relative container mx-auto text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">
            {t("contact.title") || "Contact Us"}
          </h2>

          <ul className="space-y-4 md:space-y-6 max-w-xl mx-auto text-base md:text-lg">
            {/* Email */}
            <li className="flex items-center space-x-3 md:space-x-4">
              <Mail className="h-5 w-5 md:h-6 md:w-6 text-white flex-shrink-0" />
              <a
                href="mailto:support@kurukshetram.com"
                className="hover:underline text-white break-all"
              >
                {t("contact.email") || "sjm.itprojects@gmail.com"}
              </a>
            </li>

            {/* Phone */}
            <li className="flex items-center space-x-3 md:space-x-4">
              <Phone className="h-5 w-5 md:h-6 md:w-6 text-white flex-shrink-0" />
              <a href="tel:8964900009" className="hover:underline text-white">
                {t("contact.phone") || "8964900009"}
              </a>
            </li>

            {/* Address */}
            <li className="flex items-start space-x-3 md:space-x-4">
              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white mt-1 flex-shrink-0" />
              <a
                href="https://www.google.com/maps?q=flat+104,+Arlington+Heights+Whitefields,+HITEC+city,+Kondapur,+Telangana+500084"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white leading-relaxed"
              >
                {t("contact.address") || "Arlington Heights, Whitefields, HITEC City, Kondapur, Telangana 500084"}
              </a>
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;