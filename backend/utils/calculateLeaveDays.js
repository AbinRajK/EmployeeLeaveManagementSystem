const calculateLeaveDays = (
  fromDate,
  toDate
) => {
  return (
    Math.ceil(
      (new Date(toDate) -
        new Date(fromDate)) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
};

module.exports =
  calculateLeaveDays;