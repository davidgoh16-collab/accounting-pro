export const sanitizeForFirestore = (obj: any): any => {
    if (obj === undefined) {
        return null;
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => {
            const sanitizedItem = sanitizeForFirestore(item);
            // Firestore doesn't support nested arrays. Convert to object.
            if (Array.isArray(sanitizedItem)) {
                return { ...sanitizedItem };
            }
            return sanitizedItem;
        });
    }

    // Preserve special types (Date, Timestamp, GeoPoint, DocumentReference, etc.)
    // If it's not a plain Object, return it as is.
    if (obj.constructor && obj.constructor.name !== 'Object') {
        return obj;
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
