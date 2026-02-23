export const formatTimeAgo = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return '';

    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) {
        return 'gerade eben';
    }
    if (seconds < 60) {
        return 'vor einer Minute';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    }
    return date.toLocaleDateString('de-DE');
};
