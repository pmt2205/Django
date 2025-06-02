export const formatToMillions = (from, to, type) => {
    const fromMil = (from / 1_000_000).toFixed(1);
    const toMil = (to / 1_000_000).toFixed(1);
    const suffix = type === 'hourly' ? 'triệu/giờ' : 'triệu/tháng';

    const fromStr = fromMil.endsWith('.0') ? parseInt(fromMil) : fromMil;
    const toStr = toMil.endsWith('.0') ? parseInt(toMil) : toMil;

    return `${fromStr} - ${toStr} ${suffix}`;
};
