export const formatPrice = (x) => {
  if (!x) {
    return x;
  }

  const value = Math.ceil(x * 100) / 100;

  const parts = value.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts[1]) parts[1] = parts[1].length === 1 ? `${parts[1]}0` : parts[1].substr(0, 2);

  return parts.length > 1 ? `${parts.join('.')}` : `${parts[0]}.00`;
};
