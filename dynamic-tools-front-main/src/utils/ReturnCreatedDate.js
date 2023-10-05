const ReturnCreated = (createdDate) => {
  const date = new Date();
  const date1 = new Date(createdDate);

  function getMonthLength(year, month) {
    const hour = 1000 * 60 * 60;
    const day = hour * 24;
    const currentMonth = new Date(year, month, 1);
    const nextMonth = new Date(year, month + 1, 1);
    const length = Math.ceil((nextMonth.getTime() - currentMonth.getTime() - hour) / day);

    return length;
  }

  function getNumberOfDays(firstDate, secondDate) {
    let yearDiff = parseInt(secondDate.getFullYear() - firstDate.getFullYear(), 10);
    let monthDiff = parseInt(secondDate.getMonth() - firstDate.getMonth(), 10);
    let dayDiff = parseInt(secondDate.getDate() - firstDate.getDate(), 10);

    let dateHash = {};

    while (true) {
      dateHash = {};
      dateHash.y = yearDiff;

      if (monthDiff < 0) {
        yearDiff -= 1;
        monthDiff += 12;
        continue;
      }

      dateHash.m = monthDiff;

      if (dayDiff < 0) {
        monthDiff -= 1;
        dayDiff += getMonthLength(secondDate.getFullYear(), secondDate.getMonth());
        continue;
      }

      dateHash.d = dayDiff;
      break;
    }

    return dateHash;
  }

  const getdeploedDate = getNumberOfDays(date1, date);
  let displayDate = '';

  if (getdeploedDate.y > 0) {
    displayDate += `${getdeploedDate.y} year `;
  }

  if (getdeploedDate.y === 0 && getdeploedDate.m > 0) {
    displayDate += `${getdeploedDate.m} month `;
  }

  if (getdeploedDate.m === 0 && getdeploedDate.d > 0) {
    displayDate += `${getdeploedDate.d} day `;
  }

  if (!displayDate) {
    displayDate = 'Today';
  }

  return displayDate;
};

export default ReturnCreated;
