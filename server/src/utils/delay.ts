const delay = (ms: number): Promise<NodeJS.Timeout> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export default delay;
