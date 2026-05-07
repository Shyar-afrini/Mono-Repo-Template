const getCurrentTime = () => {
  const date = new Date();
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getDayTimeStatus = () => {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 12) {
    return {
      status: "Morning",
      code: "morning",
    };
  } else if (hours >= 12 && hours < 18) {
    return {
      status: "Afternoon",
      code: "afternoon",
    };
  } else {
    return {
      status: "Night",
      code: "night",
    };
  }
};
export { getCurrentTime, getDayTimeStatus };
