export const getMockChatResponse = async (userMessage) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ reply: `Planning your dream trip to ${userMessage.split(' ').pop()}! ✈️` });
    }, 1000);
  });
};

