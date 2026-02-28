export const sanitizeForFirestore = (obj: any): any => {
    if (obj === undefined) {
        return null;
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Explicitly handle Arrays
    if (Array.isArray(obj)) {
        return obj.map((item) => {
            const sanitizedItem = sanitizeForFirestore(item);

            // CRITICAL FIX: Firestore throws "invalid nested entity" if an array contains another array.
            // If the recursive call returned an array, we MUST convert it to an object (map).
            if (Array.isArray(sanitizedItem)) {
                return { ...sanitizedItem };
            }
            return sanitizedItem;
        });
    }

    // Preserve special Firestore types (Date, Timestamp, GeoPoint, DocumentReference)
    // We whitelist these to avoid sanitizing them into plain objects (which might lose their type).
    // However, we MUST sanitize everything else (custom classes, etc.) to ensure no invalid data slips through.
    if (obj.constructor) {
        const name = obj.constructor.name;
        // Check for standard Date
        if (name === 'Date' || obj instanceof Date) return obj;
        // Check for Firestore Timestamp (often has toDate)
        if (name === 'Timestamp' || (typeof obj.toDate === 'function' && typeof obj.toMillis === 'function')) return obj;
        // Check for GeoPoint
        if (name === 'GeoPoint') return obj;
        // Check for DocumentReference
        if (name === 'DocumentReference') return obj;
    }

    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            let newKey = key;
            // Firestore keys cannot contain dots or be empty
            if (newKey.includes('.')) {
                newKey = newKey.replace(/\./g, '_');
            }
            if (!newKey) continue;

            newObj[newKey] = sanitizeForFirestore(obj[key]);
        }
    }
    return newObj;
};
