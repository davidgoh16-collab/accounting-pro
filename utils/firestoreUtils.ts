export const sanitizeForFirestore = (obj: any): any => {
    if (obj === undefined) {
        return null;
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeForFirestore);
    }

    // Preserve special types (Date, Timestamp, GeoPoint, DocumentReference, etc.)
    // If it's not a plain Object, return it as is.
    if (obj.constructor && obj.constructor.name !== 'Object') {
        return obj;
    }

    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = sanitizeForFirestore(obj[key]);
        }
    }
    return newObj;
};
