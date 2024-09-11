export const orderDesc = (inputArray) => {
    return inputArray = inputArray.sort((a, b) => {
        const dateA = new Date(a.start);
        const dateB = new Date(b.start);
        return dateB - dateA;
    })
}

export const orderAsc = (inputArray) => {
    return inputArray = inputArray.sort((a, b) => {
        const dateA = new Date(a.start);
        const dateB = new Date(b.start);
        return dateA - dateB;
    })
}