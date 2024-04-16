export const getMinMaxValue = (data: any[], key: string) => {
  const values = data.map((item) => item[key]);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
};
export const formatMoneyDataToNumber = (data: { [key: string]: any }) => {
  return Object.keys(data).reduce((acc: any, key: string) => {
    return {
      ...acc,
      ...data,
      ["num_" + key]: Number(String(data[key]).replace(/[^0-9.-]+/g, "")),
    };
  }, {});
};
