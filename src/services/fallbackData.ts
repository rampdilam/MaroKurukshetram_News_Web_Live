// Fallback data for when API is unavailable
export const fallbackData = {
  languages: [
    {
      id: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
      languageName: "English",
      code: "en",
      icon: "/placeholder.svg",
      is_active: 1
    },
    {
      id: "d9badd6f-ffb3-4fff-91aa-b14c7af45e06",
      languageName: "Hindi",
      code: "hi",
      icon: "/placeholder.svg",
      is_active: 1
    },
    {
      id: "90255d91-aead-47c9-ba76-ea85e75dc68b",
      languageName: "Telugu",
      code: "te",
      icon: "/placeholder.svg",
      is_active: 1
    }
  ],
  
  categories: [
    {
      id: "1",
      name: "Politics",
      language_id: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
      icon: "/placeholder.svg",
      color: "#ef4444",
      is_active: 1
    },
    {
      id: "2",
      name: "Sports",
      language_id: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
      icon: "/placeholder.svg",
      color: "#10b981",
      is_active: 1
    },
    {
      id: "3",
      name: "Business",
      language_id: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
      icon: "/placeholder.svg",
      color: "#f59e0b",
      is_active: 1
    }
  ],

  states: [
    {
      id: "1",
      stateName: "Andhra Pradesh",
      language_id: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
      isDeleted: 0,
      is_active: 1
    },
    {
      id: "2",
      stateName: "Telangana",
      language_id: "5dd95034-d533-4b09-8687-cd2ed3682ab6",
      isDeleted: 0,
      is_active: 1
    }
  ],

  districts: [
    {
      id: "1",
      districtName: "Hyderabad",
      state_id: "2",
      isDeleted: 0,
      is_active: 1
    },
    {
      id: "2",
      districtName: "Vijayawada",
      state_id: "1",
      isDeleted: 0,
      is_active: 1
    }
  ],

  newsItems: [
    {
      id: "fallback-1",
      title: "Service Temporarily Unavailable",
      shortNewsContent: "We are currently experiencing technical difficulties. Please try again later.",
      media: [{ mediaUrl: "/placeholder.svg" }],
      categoryName: "General",
      districtName: "Unknown",
      stateName: "Unknown",
      readTime: "1 min",
      authorName: "System",
      createdAt: new Date().toISOString()
    }
  ]
};

export const getFallbackMessage = (type: string): string => {
  const messages = {
    network: "Unable to connect to the server. Please check your internet connection.",
    server: "Server is temporarily unavailable. Please try again later.",
    notFound: "The requested information is not available at the moment.",
    general: "Something went wrong. Please try again later."
  };
  
  return messages[type as keyof typeof messages] || messages.general;
};

