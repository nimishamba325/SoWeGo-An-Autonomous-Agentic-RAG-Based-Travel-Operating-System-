export const getChatResponse = async (messages, language, location, userProfile) => { // <-- 1. Accept userProfile
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 2. Send all four pieces of data
      body: JSON.stringify({ 
        history: messages,
        language: language,
        location: location,
        userProfile: userProfile // <-- 3. Add the profile
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Failed to get chat response:", error);
    return { reply: "I'm sorry, but I'm having trouble connecting to my brain right now. Please try again in a moment." };
  }
};