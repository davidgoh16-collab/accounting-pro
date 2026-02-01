#!/bin/bash
echo "Attempting to configure CORS for a-level-geography.firebasestorage.app..."

# Try gsutil first (classic tool)
if command -v gsutil &> /dev/null; then
    echo "Using gsutil..."
    gsutil cors set cors.json gs://a-level-geography.firebasestorage.app
    if [ $? -eq 0 ]; then
        echo "CORS successfully configured!"
        exit 0
    else
        echo "gsutil failed. Check permissions."
    fi
else
    echo "gsutil not found."
fi

# Try gcloud (modern tool)
if command -v gcloud &> /dev/null; then
    echo "Using gcloud storage..."
    gcloud storage buckets update gs://a-level-geography.firebasestorage.app --cors-file=cors.json
    if [ $? -eq 0 ]; then
        echo "CORS successfully configured!"
        exit 0
    else
        echo "gcloud failed. Check permissions."
    fi
else
    echo "gcloud not found."
fi

echo "Could not configure CORS automatically. Please run manually: gsutil cors set cors.json gs://a-level-geography.firebasestorage.app"
exit 1
