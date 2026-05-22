export function toIso(d) {
    return d.toISOString();
}
export function metadataRecord(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }
    return null;
}
