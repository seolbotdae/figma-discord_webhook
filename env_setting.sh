#!/bin/bash

echo "To use discord webhook, a webhook address is required."
echo ""
echo "Please select the task you want"

while true; do
    echo ""
    echo "1. Enter Address URL"
    echo "2. Check your discord webhook address"
    echo "3. Exit"
    echo ""
    read -p "select (1/2/3): " choice

    case $choice in
        1)
            read -p "Enter the Discord Web Hook address : " url
            echo "$url"
            echo "WEBHOOK_URL=$url" > .env
            echo ""
            ;;
        2)
            cat .env
            echo ""
            ;;
        3)
            exit 0
            ;;
        *)
            echo "Please enter a valid option. (1/2/3)"
            ;;
    esac
done
