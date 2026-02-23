class Extra {
    /**
     * 
     * @param {string} id 
     */
    formatName(id) {
        const exceptions = ['of', 'the', 'and', 'a', 'an', 'in', 'on', 'with', 'at', 'by', 'for', 'to'];
        let nm
        if (id.includes(':')) {
            nm = id.split(':')[1];
        }
        return nm
            .replace(/_/g, ' ')
            .split(' ')
            .map((word, index) => {
                if (index !== 0 && exceptions.includes(word)) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }
}

export default new Extra();