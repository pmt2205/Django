export const formatToMillions = (from, to, type) => {
    if (type === 'project') {
        return 'Thỏa thuận';
    }

    if (type === 'hourly') {
        // Chia cho 1000 để hiển thị nghìn, làm tròn 1 chữ số thập phân nếu cần
        const fromThousand = (from / 1000);
        const toThousand = (to / 1000);

        const fromStr = fromThousand % 1 === 0 ? fromThousand.toString() : fromThousand.toFixed(1);
        const toStr = toThousand % 1 === 0 ? toThousand.toString() : toThousand.toFixed(1);

        return `${fromStr} - ${toStr} nghìn /giờ`;
    }


    // Các loại khác (vd: monthly)
    const fromMil = (from / 1_000_000).toFixed(1);
    const toMil = (to / 1_000_000).toFixed(1);
    const suffix = 'triệu/tháng';

    const fromStr = fromMil.endsWith('.0') ? parseInt(fromMil) : fromMil;
    const toStr = toMil.endsWith('.0') ? parseInt(toMil) : toMil;

    return `${fromStr} - ${toStr} ${suffix}`;
};
