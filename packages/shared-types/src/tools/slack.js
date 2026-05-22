export function priorityToSeverity(priority) {
    switch (priority) {
        case 'LOW':
            return 'info';
        case 'MEDIUM':
            return 'warning';
        case 'HIGH':
            return 'error';
        default:
            return 'warning';
    }
}
