export const formatToMillions = (from, to, type) => {
    const isInvalid = val => val === null || val === undefined || isNaN(val) || val < 0;

    if (isInvalid(from) && isInvalid(to)) {
        return "Thỏa thuận";
    }

    from = isInvalid(from) ? 0 : from;
    to = isInvalid(to) ? 0 : to;

    

    const fromThousand = from / 1000;
    const toThousand = to / 1000;

    if (fromThousand === 0 && toThousand === 0) {
        return "Thỏa thuận";
    }

    const fromStr = Number.isInteger(fromThousand) ? fromThousand.toString() : fromThousand.toFixed(1);
    const toStr = Number.isInteger(toThousand) ? toThousand.toString() : toThousand.toFixed(1);

    return `${fromStr} - ${toStr}k /giờ`;
};
