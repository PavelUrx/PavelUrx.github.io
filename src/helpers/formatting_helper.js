
export const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
}

export const formatProjectName = (rawName) => {
    var find = '-';
    var re = new RegExp(find, 'g');
    return rawName.replace(re, ' ');
}
