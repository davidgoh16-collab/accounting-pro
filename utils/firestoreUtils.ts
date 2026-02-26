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

    // Preserve special Firestore types (Date, Timestamp, GeoPoint, DocumentReference, etc.)
    // These usually have a constructor name that is not 'Object'.
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
