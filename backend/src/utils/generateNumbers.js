export const generateNumbers = () => {
    let numbers = new Set();

    while (numbers.size < 5) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(numbers);
};

export const generateWeightedNumbers = (frequencyMap) => {
    // Algorithmic logic: weighted by most frequent scores
    // We create an array where numbers appearing in scores are more likely to be picked
    let pool = [];
    for (let i = 1; i <= 45; i++) {
        const weight = (frequencyMap[i] || 0) + 1; // At least 1 chance
        for (let j = 0; j < weight; j++) {
            pool.push(i);
        }
    }

    let numbers = new Set();
    while (numbers.size < 5) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        numbers.add(pool[randomIndex]);
    }
    return Array.from(numbers);
};