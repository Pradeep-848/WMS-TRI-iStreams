export const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatTime = (date) => {
  if (!date || isNaN(date.getTime())) return ''; // <-- Prevent NaN
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds} ${ampm}`;
};

export const formatNormalDate = (normaldate) => {
  const day = String(normaldate.getDate()).padStart(2, '0');
  const month = String(normaldate.getMonth() + 1).padStart(2, '0');
  const year = normaldate.getFullYear();
  return `${year}${month}${day}`;
};

export const formatNormalTime = (normaldate) => {
  const hours = String(normaldate.getHours()).padStart(2, '0');
  const minutes = String(normaldate.getMinutes()).padStart(2, '0');
  const seconds = String(normaldate.getSeconds()).padStart(2, '0');
  return `${hours}${minutes}${seconds}`;
};

export const decodeMicrosoftDate = (msDateString) => {
  const match = /\/Date\((\d+)\)\//.exec(msDateString);
  return match ? new Date(parseInt(match[1], 10)) : null;
};

export const formatSoapDate = (soapDate) => {
  // /Date(1750939947000)/
  const timestamp = parseInt(soapDate.replace(/\/Date\((\d+)\)\//, '$1'), 10);
  return new Date(timestamp).toLocaleString();
};

export const formatSoapDateonly = (dateString) => {
  try {
    if (!dateString) return "Unknown Date";

    // Extract timestamp from /Date(timestamp)/ format
    const timestamp = parseInt(dateString.match(/\d+/)[0]);
    const date = new Date(timestamp);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    // Otherwise normal formatted date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown Date";
  }
};

export const formatSoapTimeOnly = (dateString) => {
  try {
    if (!dateString) return "";

    const timestamp = parseInt(dateString.match(/\d+/)[0]);
    const date = new Date(timestamp);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true, // 12-hour format like 2:30 PM
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

export const formatSqlDateTime = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};

export const formatDateForSQL = (dateStr) => {
  if (!dateStr) return '';

  // Expected input: "25-Sep-2025"
  const months = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  const [day, mon, year] = dateStr.split('-');
  const month = months[mon];

  if (!month) {
    console.warn('Invalid month in date string:', dateStr);
    return '';
  }

  return `${year}-${month}-${day.padStart(2, '0')}`; // "2025-09-25"
};

export const formatSoapDateWithTime = (dateString) => {
  try {
    if (!dateString) return "Unknown Date";

    // Extract timestamp from /Date(timestamp)/ format
    const timestamp = parseInt(dateString.match(/\d+/)[0]);
    const date = new Date(timestamp);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    // Format time (12-hour with AM/PM)
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `Today at ${time}`;
    if (isYesterday) return `Yesterday at ${time}`;

    // Otherwise normal formatted date + time
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) + `, ${time}`
    );
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown Date";
  }
};

export const parseSoapDateintoIstFormat = (soapDate) => {
  if (!soapDate) return '';
  const timestamp = parseInt(soapDate.replace(/\/Date\((\d+)\)\//, '$1'), 10);
  if (isNaN(timestamp)) return '';

  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day}-${monthName}-${year}`;
};