export const getMaxValue = (data: any[], key: string) => {
  return Math.max(...data.map((item: any) => item[key]));
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
