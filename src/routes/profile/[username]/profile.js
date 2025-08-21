export function reorder(unsorted, orderBy, orderDir, showFinished, showDropped) {

    unsorted = unsorted.filter(a => (a.status && showFinished) || (!a.status && showDropped));

    let sorted;

    if (orderBy == "score") {
        sorted = [...unsorted];
        sorted.sort((a, b) => b.score - a.score);
        if (orderDir != "desc") sorted.reverse();
    } else {
        sorted = [];

        for (let i = 0; i < unsorted.length;) {
            if (unsorted[i].afterAnimeId === null) {
                sorted.push(unsorted[i]);
                unsorted.splice(i, 1);
            } else {
                i++;
            }
        }

        while (unsorted.length) {
            let inserted = false;
            for (let i = 0; i < unsorted.length; i++) {
                for (let j = 0; j < sorted.length; j++) {
                    if (unsorted[i].afterAnimeId == sorted[j].animeId) {
                        sorted.splice(j + 1, 0, unsorted[i]);
                        unsorted.splice(i, 1);
                        inserted = true;
                        break;
                    }
                    if (unsorted[i].animeId == sorted[j].afterAnimeId) {
                        sorted.splice(j, 0, unsorted[i]);
                        unsorted.splice(i, 1);
                        inserted = true;
                        break;
                    }
                }
                if (inserted) break;
            }
            if (!inserted) {
                sorted.push(unsorted[0]);
                unsorted.splice(0, 1);
            }
        }

        if (orderDir == "desc") sorted.reverse();
    }

    return sorted;
}