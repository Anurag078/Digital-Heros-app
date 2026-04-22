export const calculateMatch = (userScores, drawNumbers) => {
    // userScores is [{score: 10}, {score: 22}, ...]
    // drawNumbers is [5, 12, 18, 33, 40]
    
    let matchCount = 0;
    const drawSet = new Set(drawNumbers);

    userScores.forEach((s) => {
        if (drawSet.has(s.score)) {
            matchCount++;
        }
    });

    return matchCount;
};
